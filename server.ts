import "dotenv/config"
import bcrypt from "bcryptjs"
import cors from "cors"
import express, { type Request, type RequestHandler } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import {
  AttendanceStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from "@prisma/client"

const prisma = new PrismaClient()
const app = express()
const jwtSecret = process.env.JWT_SECRET
const port = Number(process.env.PORT ?? 5000)

if (!jwtSecret) {
  throw new Error("JWT_SECRET wajib diatur di environment.")
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT harus berupa angka antara 1 dan 65535.")
}

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: "1mb" }))

interface AuthContext {
  userId: string
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthContext
    }
  }
}

const roleNames: Record<UserRole, string> = {
  [UserRole.ADMIN]: "admin",
  [UserRole.GURU]: "teacher",
  [UserRole.SISWA]: "student",
}

const attendanceStatuses: Record<string, AttendanceStatus> = {
  HADIR: AttendanceStatus.HADIR,
  Hadir: AttendanceStatus.HADIR,
  IZIN: AttendanceStatus.IZIN,
  Izin: AttendanceStatus.IZIN,
  SAKIT: AttendanceStatus.SAKIT,
  Sakit: AttendanceStatus.SAKIT,
  ALPHA: AttendanceStatus.ALPHA,
  Alpa: AttendanceStatus.ALPHA,
  ALPA: AttendanceStatus.ALPHA,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date
}

function queryString(request: Request, key: string): string | undefined {
  const value = request.query[key]
  return typeof value === "string" ? value : undefined
}

const authenticateToken: RequestHandler = async (request, response, next) => {
  const authorization = request.header("authorization")
  const [scheme, token] = authorization?.split(" ") ?? []

  if (scheme !== "Bearer" || !token) {
    response.status(401).json({ error: "Token autentikasi diperlukan." })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload
    if (typeof payload.sub !== "string") {
      response.status(401).json({ error: "Token tidak valid." })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    })

    if (!user) {
      response.status(401).json({ error: "Akun tidak ditemukan." })
      return
    }

    request.authUser = { userId: user.id, role: user.role }
    next()
  } catch {
    response.status(401).json({ error: "Token tidak valid atau kedaluwarsa." })
  }
}

function requireRole(...roles: UserRole[]): RequestHandler {
  return (request, response, next) => {
    if (!request.authUser || !roles.includes(request.authUser.role)) {
      response.status(403).json({ error: "Anda tidak memiliki akses ke resource ini." })
      return
    }

    next()
  }
}

app.post("/api/auth/login", async (request, response) => {
  if (!isRecord(request.body)) {
    response.status(400).json({ error: "Body permintaan tidak valid." })
    return
  }

  const identifier = request.body.identifier
  const password = request.body.password
  if (
    typeof identifier !== "string" ||
    !identifier.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    response.status(400).json({ error: "Identifier dan password wajib diisi." })
    return
  }

  const user = await prisma.user.findUnique({
    where: { username: identifier.trim() },
  })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    response.status(401).json({ error: "Identifier atau password salah." })
    return
  }

  const token = jwt.sign({ role: user.role }, jwtSecret, {
    subject: user.id,
    expiresIn: "8h",
  })

  response.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: roleNames[user.role],
      name: user.name,
      avatarUrl: null,
      kelas: user.kelas,
    },
  })
})

app.get("/api/attendance", authenticateToken, async (request, response) => {
  const fromValue = queryString(request, "from")
  const toValue = queryString(request, "to")
  const from = fromValue ? parseDate(fromValue) : undefined
  const to = toValue ? parseDate(toValue) : undefined

  if ((fromValue && !from) || (toValue && !to)) {
    response.status(400).json({ error: "Filter tanggal harus berformat YYYY-MM-DD." })
    return
  }

  const where: Prisma.AttendanceWhereInput = {
    ...(request.authUser?.role === UserRole.SISWA
      ? { studentId: request.authUser.userId }
      : queryString(request, "studentId")
        ? { studentId: queryString(request, "studentId") }
        : {}),
    ...(from || to
      ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {}),
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: {
      student: { select: { id: true, username: true, name: true, kelas: true } },
    },
    orderBy: { date: "desc" },
  })

  response.json(attendance)
})

app.post(
  "/api/attendance",
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.GURU),
  async (request, response) => {
    if (!isRecord(request.body)) {
      response.status(400).json({ error: "Body permintaan tidak valid." })
      return
    }

    const { studentId, date: dateValue, status, notes } = request.body
    const date = parseDate(dateValue)
    const attendanceStatus = typeof status === "string" ? attendanceStatuses[status] : undefined

    if (
      typeof studentId !== "string" ||
      !studentId.trim() ||
      !date ||
      !attendanceStatus ||
      (notes !== undefined && notes !== null && typeof notes !== "string")
    ) {
      response.status(400).json({ error: "studentId, tanggal, atau status presensi tidak valid." })
      return
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId.trim() },
      select: { id: true, role: true },
    })

    if (!student || student.role !== UserRole.SISWA) {
      response.status(404).json({ error: "Akun siswa tidak ditemukan." })
      return
    }

    const attendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date } },
      update: { status: attendanceStatus, notes: typeof notes === "string" ? notes : null },
      create: {
        studentId: student.id,
        date,
        status: attendanceStatus,
        notes: typeof notes === "string" ? notes : null,
      },
      include: {
        student: { select: { id: true, username: true, name: true, kelas: true } },
      },
    })

    response.status(200).json(attendance)
  },
)

app.get("/api/quizzes", authenticateToken, async (request, response) => {
  const quizzes = await prisma.quiz.findMany({
    where: request.authUser?.role === UserRole.SISWA
      ? { OR: [{ kelas: null }, { kelas: (await prisma.user.findUnique({
          where: { id: request.authUser.userId },
          select: { kelas: true },
        }))?.kelas ?? "" }] }
      : undefined,
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
          explanation: true,
          position: true,
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  response.json(quizzes)
})

app.post(
  "/api/quizzes/submit",
  authenticateToken,
  requireRole(UserRole.SISWA),
  async (request, response) => {
    if (!isRecord(request.body)) {
      response.status(400).json({ error: "Body permintaan tidak valid." })
      return
    }

    const quizId = request.body.quizId
    const answers = request.body.answers
    if (typeof quizId !== "string" || !quizId.trim() || !isRecord(answers)) {
      response.status(400).json({ error: "quizId dan objek answers wajib diisi." })
      return
    }

    if (!Object.values(answers).every((answer) => typeof answer === "string")) {
      response.status(400).json({ error: "Setiap jawaban harus berupa teks." })
      return
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId.trim() },
      select: {
        id: true,
        questions: { select: { id: true, correctAnswer: true } },
      },
    })

    if (!quiz) {
      response.status(404).json({ error: "Kuis tidak ditemukan." })
      return
    }

    const questionIds = new Set(quiz.questions.map((question) => question.id))
    if (Object.keys(answers).some((questionId) => !questionIds.has(questionId))) {
      response.status(400).json({ error: "Jawaban memuat soal yang bukan bagian dari kuis." })
      return
    }

    const correct = quiz.questions.reduce(
      (total, question) => total + Number(answers[question.id] === question.correctAnswer),
      0,
    )
    const score = quiz.questions.length === 0
      ? 0
      : Math.round((correct / quiz.questions.length) * 100)
    const studentId = request.authUser!.userId
    const attempt = (await prisma.quizSubmission.count({
      where: { quizId: quiz.id, studentId },
    })) + 1

    const submission = await prisma.quizSubmission.create({
      data: {
        quizId: quiz.id,
        studentId,
        attempt,
        answers: answers as Prisma.InputJsonValue,
        score,
      },
      select: { id: true, quizId: true, attempt: true, score: true, submittedAt: true },
    })

    response.status(201).json({ ...submission, correct, total: quiz.questions.length })
  },
)

app.use((_request, response) => {
  response.status(404).json({ error: "Endpoint tidak ditemukan." })
})

app.use((error: unknown, _request: Request, response: express.Response, _next: express.NextFunction) => {
  console.error("API error:", error)
  response.status(500).json({ error: "Terjadi kesalahan pada server." })
})

const server = app.listen(port, () => {
  console.log(`MENTARI API berjalan di http://localhost:${port}`)
})

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      void prisma.$disconnect()
    })
  })
}