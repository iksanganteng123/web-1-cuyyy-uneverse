import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dummySubject, type Question, type Subject } from "../data/dummy";

export type Role = "admin" | "teacher" | "student";
export type AttendanceStatus = "Hadir" | "Izin" | "Sakit" | "Alpa";

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface StudentRecord {
  id: string;
  nim: string;
  name: string;
  grade: number;
  xp: number;
  completedLessonsIds: string[];
  badges: AchievementBadge[];
  loginStreak: number;
  lastLoginDate: string | null;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  teacherId: string;
}

export interface WeeklySchedule {
  id: string;
  grade: number;
  day: string;
  subject: string;
  time: string;
  room: string;
  teacherId: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  subjectId: string;
  subjectTitle: string;
  subjectCategory?: string;
  score: number;
  correct: number;
  total: number;
  xp: number;
  completedAt: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  grade: number;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  answer: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  reviewedAt?: string;
}

export interface SessionUser {
  nim: string;
  name: string;
  grade: number;
  role: Role;
}

interface AppState {
  theme: "light" | "dark";
  user: SessionUser | null;
  subjects: Subject[];
  students: StudentRecord[];
  attendance: AttendanceRecord[];
  schedules: WeeklySchedule[];
  announcements: Announcement[];
  quizResults: QuizResult[];
  homeworks: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
  setTheme: (theme: "light" | "dark") => void;
  activateUser: (user: SessionUser) => void;
  logout: () => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  addStudent: (student: Omit<StudentRecord, "id" | "xp" | "completedLessonsIds" | "badges" | "loginStreak" | "lastLoginDate">) => void;
  deleteStudent: (id: string) => void;
  removeStudentByNim: (nim: string) => void;
  setAttendance: (record: AttendanceRecord) => void;
  saveSchedule: (schedule: WeeklySchedule) => void;
  deleteSchedule: (id: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt">) => void;
  deleteAnnouncement: (id: string) => void;
  recordQuizResult: (result: Omit<QuizResult, "id" | "completedAt">) => void;
  createHomework: (homework: Omit<HomeworkAssignment, "id" | "createdAt">) => void;
  submitHomework: (submission: Omit<HomeworkSubmission, "id" | "submittedAt" | "score" | "feedback" | "reviewedAt">) => void;
  reviewHomework: (submissionId: string, score: number, feedback: string) => void;
  markLessonComplete: (lessonId: string) => void;
  addXp: (amount: number) => void;
}

type SeedQuestion = [string, string, number, string];
const questionBank = (items: SeedQuestion[]): Question[] =>
  items.map(([question, choices, answer, explanation], index) => {
    const options = choices.split("|");
    return {
      id: `seed-question-${index + 1}`,
      question,
      options,
      correctAnswer: options[answer],
      explanation,
    };
  });

const demoQuestionBanks: Record<string, Question[]> = {
  "sub-1": questionBank([
    ["Berapakah hasil 2 + 3?", "4|5|6|7", 1, "Dua ditambah tiga sama dengan lima."],
    ["Berapakah hasil 4 + 4?", "6|7|8|9", 2, "Empat ditambah empat sama dengan delapan."],
    ["Berapakah hasil 10 - 3?", "6|7|8|9", 1, "Sepuluh dikurangi tiga sama dengan tujuh."],
    ["Manakah bilangan paling besar?", "12|9|15|11", 2, "Lima belas lebih besar dari semua pilihan lainnya."],
    ["Berapakah hasil 3 + 6?", "8|9|10|11", 1, "Tiga ditambah enam sama dengan sembilan."],
    ["Angka setelah 18 adalah...", "17|18|19|20", 2, "Setelah delapan belas adalah sembilan belas."],
    ["Berapakah hasil 5 + 5?", "8|9|10|11", 2, "Lima ditambah lima sama dengan sepuluh."],
    ["Berapakah hasil 9 - 4?", "4|5|6|7", 1, "Sembilan dikurangi empat sama dengan lima."],
    ["Manakah bilangan genap?", "3|5|8|9", 2, "Delapan habis dibagi dua, jadi termasuk bilangan genap."],
    ["Berapakah hasil 2 + 7?", "8|9|10|12", 1, "Dua ditambah tujuh sama dengan sembilan."],
  ]),
  "sub-6": questionBank([
    ["Berapakah hasil 4 × 3?", "7|10|12|14", 2, "Empat kelompok berisi tiga berjumlah dua belas."],
    ["Berapakah hasil 5 × 2?", "7|10|12|15", 1, "Lima kelompok dua berjumlah sepuluh."],
    ["Berapakah hasil 3 × 6?", "9|18|21|24", 1, "Tiga kali enam sama dengan delapan belas."],
    ["Berapakah hasil 7 × 2?", "12|14|16|18", 1, "Tujuh kelompok dua berjumlah empat belas."],
    ["Berapakah hasil 20 ÷ 4?", "4|5|6|8", 1, "Dua puluh dibagi empat sama dengan lima."],
    ["Berapakah hasil 6 × 4?", "20|22|24|28", 2, "Enam kali empat sama dengan dua puluh empat."],
    ["Berapakah hasil 30 ÷ 5?", "5|6|7|8", 1, "Tiga puluh dibagi lima sama dengan enam."],
    ["Berapakah hasil 8 × 3?", "21|24|27|32", 1, "Delapan kali tiga sama dengan dua puluh empat."],
    ["Berapakah hasil 9 × 2?", "16|18|20|22", 1, "Sembilan kelompok dua berjumlah delapan belas."],
    ["Berapakah hasil 36 ÷ 6?", "5|6|7|8", 1, "Tiga puluh enam dibagi enam sama dengan enam."],
  ]),
  "sub-2": questionBank([
    ["Rumus volume tabung adalah...", "π × r² × t|s × s × s|p × l × t|½ × a × t", 0, "Volume tabung dihitung dengan π dikali jari-jari kuadrat dikali tinggi."],
    ["Volume kubus dengan sisi 3 cm adalah...", "9 cm³|18 cm³|27 cm³|30 cm³", 2, "Volume kubus adalah sisi pangkat tiga: 3 × 3 × 3 = 27."],
    ["Volume balok 4 × 3 × 2 cm adalah...", "9 cm³|12 cm³|24 cm³|32 cm³", 2, "Volume balok adalah panjang × lebar × tinggi."],
    ["Jika jari-jari lingkaran menjadi dua kali, luas alas menjadi...", "2 kali|3 kali|4 kali|6 kali", 2, "Luas memakai r², sehingga jari-jari dua kali menghasilkan luas empat kali."],
    ["Satuan yang tepat untuk volume adalah...", "cm|cm²|cm³|cm⁴", 2, "Volume mengukur ruang tiga dimensi, sehingga memakai satuan kubik."],
    ["Volume prisma dengan luas alas 12 cm² dan tinggi 5 cm adalah...", "17 cm³|30 cm³|60 cm³|120 cm³", 2, "Volume prisma = luas alas × tinggi, yaitu 12 × 5."],
    ["Volume tabung berjari-jari 7 cm, tinggi 10 cm, π=22/7 adalah...", "1.100 cm³|1.540 cm³|2.200 cm³|3.080 cm³", 1, "π × 7² × 10 = 22/7 × 49 × 10 = 1.540 cm³."],
    ["Balok berukuran 5 cm, 4 cm, dan 3 cm memiliki volume...", "12 cm³|20 cm³|60 cm³|80 cm³", 2, "Kalikan ketiga ukuran: 5 × 4 × 3 = 60."],
    ["Volume limas adalah...", "Luas alas × tinggi|⅓ × luas alas × tinggi|½ × luas alas × tinggi|2 × luas alas × tinggi", 1, "Volume limas adalah sepertiga hasil kali luas alas dan tinggi."],
    ["Jika volume kubus 64 cm³, panjang sisinya adalah...", "4 cm|6 cm|8 cm|16 cm", 0, "Empat pangkat tiga sama dengan 64."],
  ]),
  "sub-3": questionBank([
    ["Huruf awal kata apel adalah...", "A|B|C|D", 0, "Kata apel dimulai dengan huruf A."],
    ["Huruf setelah B adalah...", "A|C|D|E", 1, "Urutan alfabet setelah B adalah C."],
    ["Kata yang dimulai dengan huruf M adalah...", "Meja|Buku|Sapu|Topi", 0, "Meja diawali huruf M."],
    ["Huruf vokal pada pilihan berikut adalah...", "B|C|I|D", 2, "I termasuk huruf vokal: A, I, U, E, O."],
    ["Kata 'ibu' terdiri dari berapa huruf?", "2|3|4|5", 1, "Ibu tersusun dari tiga huruf: i-b-u."],
    ["Huruf terakhir kata 'buku' adalah...", "B|U|K|A", 1, "Kata buku berakhir dengan huruf U."],
    ["Manakah yang termasuk nama orang?", "Rani|meja|berlari|merah", 0, "Rani adalah nama orang dan ditulis dengan huruf kapital."],
    ["Lawan kata 'besar' adalah...", "Tinggi|Kecil|Panjang|Lebar", 1, "Lawan kata besar adalah kecil."],
    ["Tanda baca di akhir kalimat berita adalah...", ".|,|?|:", 0, "Kalimat berita biasanya diakhiri tanda titik."],
    ["Susunan huruf yang membentuk kata 'sapi' adalah...", "S-A-P-I|S-I-P-A|P-A-S-I|A-S-I-P", 0, "Huruf S, A, P, I berurutan membentuk kata sapi."],
  ]),
  "sub-7": questionBank([
    ["Tokoh dalam cerita adalah...", "Orang atau hewan dalam cerita|Judul cerita|Tempat membaca|Nama penerbit", 0, "Tokoh adalah pelaku yang mengalami kejadian dalam cerita."],
    ["Tempat terjadinya cerita disebut...", "Tema|Latar tempat|Amanat|Tokoh", 1, "Latar tempat menjelaskan lokasi kejadian cerita."],
    ["Pesan baik yang disampaikan cerita disebut...", "Amanat|Judul|Dialog|Paragraf", 0, "Amanat adalah pesan atau pelajaran dari cerita."],
    ["Orang yang menceritakan kisah disebut...", "Pembaca|Narator|Tokoh utama|Penonton", 1, "Narator adalah pihak yang menceritakan suatu kisah."],
    ["Kalimat yang berisi percakapan tokoh disebut...", "Dialog|Judul|Amanat|Latar", 0, "Dialog adalah percakapan antara tokoh-tokoh."],
    ["Gagasan utama sebuah bacaan disebut...", "Ide pokok|Tanda baca|Kata depan|Ejaan", 0, "Ide pokok adalah inti pembahasan dalam paragraf."],
    ["Kata tanya untuk menanyakan tempat adalah...", "Siapa|Kapan|Di mana|Mengapa", 2, "Kata tanya di mana digunakan untuk menanyakan tempat."],
    ["Kata tanya untuk menanyakan alasan adalah...", "Apa|Siapa|Mengapa|Kapan", 2, "Mengapa digunakan untuk menanyakan sebab atau alasan."],
    ["Urutan kejadian dalam cerita disebut...", "Alur|Amanat|Latar|Tokoh", 0, "Alur adalah rangkaian peristiwa dalam cerita."],
    ["Sikap yang dapat diteladani dari tokoh disebut...", "Watak baik|Latar|Judul|Alur", 0, "Watak baik tokoh dapat menjadi contoh bagi pembaca."],
  ]),
  "sub-4": questionBank([
    ["Hewan yang menggunakan sayap untuk terbang adalah...", "Ikan|Burung|Kucing|Kelinci", 1, "Burung menggunakan sayap untuk terbang."],
    ["Alat gerak ikan adalah...", "Sayap|Sirip|Kaki|Tanduk", 1, "Sirip membantu ikan bergerak di dalam air."],
    ["Kucing menggunakan ... untuk mencium bau.", "Mata|Hidung|Telinga|Ekor", 1, "Hidung adalah indra penciuman kucing."],
    ["Bagian tubuh burung untuk mengambil makanan adalah...", "Paruh|Sirip|Cangkang|Sisik", 0, "Burung menggunakan paruh untuk mengambil makanan."],
    ["Hewan yang memiliki cangkang untuk melindungi tubuh adalah...", "Kura-kura|Ayam|Kuda|Kupu-kupu", 0, "Cangkang keras kura-kura melindungi tubuhnya."],
    ["Kelinci bergerak dengan cara...", "Melompat|Terbang|Berenang di udara|Merayap", 0, "Kaki belakang kelinci kuat untuk melompat."],
    ["Bagian tubuh yang membantu burung menjaga keseimbangan saat terbang adalah...", "Ekor|Gigi|Lidah|Perut", 0, "Ekor membantu burung mengarahkan dan menyeimbangkan tubuh."],
    ["Hewan yang bernapas dengan insang adalah...", "Kucing|Ikan|Ayam|Sapi", 1, "Ikan mengambil oksigen dari air menggunakan insang."],
    ["Kaki bebek berselaput agar mudah...", "Berenang|Memanjat|Menggali|Terbang tinggi", 0, "Selaput kaki mendorong air saat bebek berenang."],
    ["Sayap kupu-kupu berguna untuk...", "Terbang|Mengunyah|Mendengar|Bernapas di air", 0, "Kupu-kupu menggunakan sayap untuk terbang."],
  ]),
  "sub-8": questionBank([
    ["Es yang mencair berubah menjadi...", "Air|Uap|Batu|Salju", 0, "Es mencair dari wujud padat menjadi cair."],
    ["Air yang dipanaskan hingga mendidih dapat berubah menjadi...", "Es|Uap air|Pasir|Minyak", 1, "Air menguap saat menerima panas."],
    ["Air yang dimasukkan ke freezer akan...", "Membeku|Menguap|Mencair|Mendidih", 0, "Suhu dingin mengubah air cair menjadi es."],
    ["Perubahan gas menjadi cair disebut...", "Menguap|Mencair|Mengembun|Membeku", 2, "Uap yang mendingin berubah menjadi titik air melalui pengembunan."],
    ["Benda padat memiliki bentuk yang...", "Tetap|Selalu berubah|Tidak ada|Mengikuti wadah sepenuhnya", 0, "Benda padat mempunyai bentuk dan volume yang tetap."],
    ["Contoh benda cair adalah...", "Batu|Air|Udara|Kayu", 1, "Air adalah benda cair dan mengikuti bentuk wadah."],
    ["Jemuran kering karena air mengalami...", "Pembekuan|Penguapan|Pengembunan|Pencairan", 1, "Panas matahari menguapkan air dari pakaian."],
    ["Titik air pada luar gelas dingin terbentuk karena...", "Pengembunan|Pembakaran|Pembekuan|Pencairan", 0, "Uap air di udara mendingin dan mengembun di gelas."],
    ["Mentega yang dipanaskan akan...", "Mencair|Membeku|Mengeras|Menguap seluruhnya", 0, "Panas membuat mentega padat berubah menjadi cair."],
    ["Perubahan wujud dari cair menjadi padat disebut...", "Mencair|Menguap|Membeku|Mengembun", 2, "Cairan yang kehilangan panas dapat membeku menjadi padat."],
  ]),
  "sub-5": questionBank([
    ["Perangkat yang digunakan untuk mengetik adalah...", "Monitor|Papan ketik|Speaker|Kamera", 1, "Papan ketik atau keyboard digunakan untuk mengetik."],
    ["Layar komputer disebut...", "Monitor|Mouse|Printer|Mikrofon", 0, "Monitor menampilkan gambar dan tulisan dari komputer."],
    ["Alat untuk menggerakkan penunjuk di layar adalah...", "Mouse|Speaker|Kabel|Flashdisk", 0, "Mouse mengendalikan penunjuk pada layar."],
    ["Perangkat untuk mencetak dokumen adalah...", "Printer|Monitor|Keyboard|Webcam", 0, "Printer mencetak dokumen ke kertas."],
    ["Bagian utama komputer yang memproses instruksi adalah...", "CPU|Speaker|Mouse pad|Kabel daya", 0, "CPU memproses instruksi dan data komputer."],
    ["Perangkat untuk mendengarkan suara adalah...", "Speaker|Scanner|Keyboard|Monitor", 0, "Speaker mengeluarkan suara dari komputer."],
    ["Kamera yang terhubung ke komputer disebut...", "Webcam|Printer|Router|Flashdisk", 0, "Webcam digunakan untuk mengambil gambar atau video."],
    ["Tempat menyimpan berkas portabel yang umum adalah...", "Flashdisk|Mouse|Speaker|Monitor", 0, "Flashdisk menyimpan dan memindahkan berkas."],
    ["Kita sebaiknya menjaga komputer dengan cara...", "Menjauhkan minuman|Menumpahkan air|Memukul layar|Mencabut kabel sembarang", 0, "Cairan dapat merusak komponen komputer."],
    ["Sebelum mematikan komputer, kita sebaiknya...", "Memilih perintah Shut down|Mencabut listrik langsung|Menyiram komputer|Menutup layar keras-keras", 0, "Perintah Shut down menutup program dengan aman."],
  ]),
};

const initialStudents: StudentRecord[] = [
  { id: "s-1", nim: "202301001", name: "Budi Santoso", grade: 1, xp: 50, completedLessonsIds: [], badges: [], loginStreak: 0, lastLoginDate: null },
  { id: "s-2", nim: "82382868", name: "Sendi Dwi Putra", grade: 3, xp: 120, completedLessonsIds: [], badges: [], loginStreak: 0, lastLoginDate: null },
  { id: "s-3", nim: "231091700072", name: "Ikhsan Aslani", grade: 3, xp: 0, completedLessonsIds: [], badges: [], loginStreak: 0, lastLoginDate: null },
];

const seededSubjects = dummySubject.map((subject) => ({
  ...subject,
  lesson: subject.lesson.map((lesson) => ({
    ...lesson,
    questions:
      lesson.questions && lesson.questions.length >= 10
        ? lesson.questions
        : (demoQuestionBanks[subject.id] ?? demoQuestionBanks["sub-1"]).map((question, index) => ({
            ...question,
            id: `${lesson.id}-${index + 1}`,
          })),
  })),
}));

const getXpForScore = (correct: number, total: number) =>
  total > 0 ? Math.round((correct / total) * 100) : 0;

const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const awardBadge = (
  badges: AchievementBadge[],
  id: string,
  title: string,
  description: string,
  icon: string,
  unlockedAt: string,
) =>
  badges.some((badge) => badge.id === id)
    ? badges
    : [...badges, { id, title, description, icon, unlockedAt }];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "light",
      user: null,
      subjects: seededSubjects,
      students: initialStudents,
      attendance: [],
      schedules: [],
      announcements: [],
      quizResults: [],
      homeworks: [],
      homeworkSubmissions: [],
      setTheme: (theme) => set({ theme }),
      activateUser: (user) =>
        set((state) => {
          if (user.role !== "student") return { user };
          const matchingStudent = state.students.find((student) => student.nim === user.nim);
          const today = localDateKey();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = localDateKey(yesterday);
          const previousDate = matchingStudent?.lastLoginDate ?? null;
          const loginStreak = previousDate === today
            ? matchingStudent?.loginStreak ?? 1
            : previousDate === yesterdayKey
              ? (matchingStudent?.loginStreak ?? 0) + 1
              : 1;
          let badges = matchingStudent?.badges ?? [];
          if (loginStreak >= 3) {
            badges = awardBadge(
              badges,
              "attendance-streak",
              "Rajin Hadir",
              "Login dan belajar selama tiga hari berturut-turut.",
              "🔥",
              new Date().toISOString(),
            );
          }
          const student: StudentRecord = matchingStudent
            ? {
                ...matchingStudent,
                name: user.name,
                grade: user.grade,
                badges,
                loginStreak,
                lastLoginDate: today,
              }
            : {
                id: `stu-${user.nim}`,
                nim: user.nim,
                name: user.name,
                grade: user.grade,
                xp: 0,
                completedLessonsIds: [],
                badges,
                loginStreak,
                lastLoginDate: today,
              };
          return {
            user,
            students: matchingStudent
              ? state.students.map((item) => item.nim === user.nim ? student : item)
              : [student, ...state.students],
          };
        }),
      logout: () => set({ user: null }),
      addSubject: (subject) =>
        set((state) => ({ subjects: [subject, ...state.subjects] })),
      updateSubject: (subject) =>
        set((state) => ({
          subjects: state.subjects.map((item) => item.id === subject.id ? subject : item),
        })),
      deleteSubject: (id) =>
        set((state) => ({ subjects: state.subjects.filter((item) => item.id !== id) })),
      addStudent: (studentData) =>
        set((state) => {
          const existingStudent = state.students.find((student) => student.nim === studentData.nim);
          const student: StudentRecord = {
            id: existingStudent?.id ?? `stu-${studentData.nim}`,
            ...studentData,
            xp: existingStudent?.xp ?? 0,
            completedLessonsIds: existingStudent?.completedLessonsIds ?? [],
            badges: existingStudent?.badges ?? [],
            loginStreak: existingStudent?.loginStreak ?? 0,
            lastLoginDate: existingStudent?.lastLoginDate ?? null,
          };
          return {
            students: [
              student,
              ...state.students.filter((item) => item.nim !== studentData.nim),
            ],
          };
        }),
      createHomework: (homework) =>
        set((state) => ({
          homeworks: [
            {
              ...homework,
              id: `homework-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: new Date().toISOString(),
            },
            ...state.homeworks,
          ],
        })),
      submitHomework: (submission) =>
        set((state) => {
          const previous = state.homeworkSubmissions.find(
            (item) =>
              item.homeworkId === submission.homeworkId &&
              item.studentId === submission.studentId,
          );
          const nextSubmission: HomeworkSubmission = {
            ...previous,
            ...submission,
            id: previous?.id ?? `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            submittedAt: new Date().toISOString(),
          };
          return {
            homeworkSubmissions: [
              nextSubmission,
              ...state.homeworkSubmissions.filter((item) => item.id !== nextSubmission.id),
            ],
          };
        }),
      reviewHomework: (submissionId, score, feedback) =>
        set((state) => ({
          homeworkSubmissions: state.homeworkSubmissions.map((submission) =>
            submission.id === submissionId
              ? { ...submission, score, feedback, reviewedAt: new Date().toISOString() }
              : submission,
          ),
        })),
      deleteStudent: (id) =>
        set((state) => {
          const student = state.students.find((item) => item.id === id);
          if (!student) return state;
          return {
            students: state.students.filter((item) => item.id !== id),
            attendance: state.attendance.filter((record) => record.studentId !== student.nim),
            quizResults: state.quizResults.filter((result) => result.studentId !== student.nim),
            homeworkSubmissions: state.homeworkSubmissions.filter((item) => item.studentId !== student.nim),
          };
        }),
      removeStudentByNim: (nim) =>
        set((state) => {
          const student = state.students.find((item) => item.nim === nim);
          if (!student) return state;
          return {
            students: state.students.filter((item) => item.nim !== nim),
            attendance: state.attendance.filter((record) => record.studentId !== nim),
            quizResults: state.quizResults.filter((result) => result.studentId !== nim),
            homeworkSubmissions: state.homeworkSubmissions.filter((item) => item.studentId !== nim),
          };
        }),
      setAttendance: (record) =>
        set((state) => ({
          attendance: [
            ...state.attendance.filter(
              (item) => item.studentId !== record.studentId || item.date !== record.date,
            ),
            record,
          ],
        })),
      saveSchedule: (schedule) =>
        set((state) => ({
          schedules: [
            ...state.schedules.filter((item) => item.id !== schedule.id),
            schedule,
          ],
        })),
      deleteSchedule: (id) =>
        set((state) => ({ schedules: state.schedules.filter((item) => item.id !== id) })),
      addAnnouncement: (announcement) =>
        set((state) => ({
          announcements: [
            {
              ...announcement,
              id: `announcement-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.announcements,
          ],
        })),
      deleteAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter((item) => item.id !== id),
        })),
      recordQuizResult: (result) =>
        set((state) => {
          const xpEarned = getXpForScore(result.correct, result.total);
          const existingStudent = state.students.find((student) => student.nim === result.studentId);
          const perfectScore = result.total > 0 && result.correct === result.total;
          let badges = existingStudent?.badges ?? [];
          if (perfectScore) {
            badges = awardBadge(
              badges,
              "quiz-champion",
              "Juara Kuis",
              "Mendapat nilai sempurna pada sebuah kuis.",
              "🏆",
              new Date().toISOString(),
            );
            if (
              /matematika/i.test(result.subjectCategory ?? "") ||
              /matematika/i.test(result.subjectTitle)
            ) {
              badges = awardBadge(
                badges,
                "math-star",
                "Bintang Matematika",
                "Mendapat nilai sempurna pada kuis Matematika.",
                "⭐",
                new Date().toISOString(),
              );
            }
          }
          const students = existingStudent
            ? state.students.map((student) =>
                student.nim === result.studentId
                  ? { ...student, xp: student.xp + xpEarned, badges }
                  : student,
              )
            : state.students;
          return {
            students,
            quizResults: [
              {
                ...result,
                xp: xpEarned,
                id: `result-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                completedAt: new Date().toISOString(),
              },
              ...state.quizResults,
            ],
          };
        }),
      markLessonComplete: (lessonId) =>
        set((state) => {
          if (!state.user || state.user.role !== "student") return state;
          return {
            students: state.students.map((student) =>
              student.nim === state.user?.nim &&
              !student.completedLessonsIds.includes(lessonId)
                ? { ...student, completedLessonsIds: [...student.completedLessonsIds, lessonId] }
                : student,
            ),
          };
        }),
      addXp: (amount) =>
        set((state) => {
          if (!state.user || state.user.role !== "student") return state;
          return {
            students: state.students.map((student) =>
              student.nim === state.user?.nim
                ? { ...student, xp: student.xp + amount }
                : student,
            ),
          };
        }),
    }),
    {
      name: "elearning-sd-multple-user-storage",
      partialize: (state) => ({
        user: state.user,
        subjects: state.subjects,
        students: state.students,
        attendance: state.attendance,
        schedules: state.schedules,
        announcements: state.announcements,
        quizResults: state.quizResults,
        homeworks: state.homeworks,
        homeworkSubmissions: state.homeworkSubmissions,
        theme: state.theme,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState> & {
          students?: Array<StudentRecord & { password?: string }>;
        };
        return {
          ...currentState,
          ...persisted,
          theme: persisted.theme === "dark" ? "dark" : "light",
          students:
            persisted.students?.map((student) => ({
              ...student,
              badges: student.badges ?? [],
              loginStreak: student.loginStreak ?? 0,
              lastLoginDate: student.lastLoginDate ?? null,
            })) ?? currentState.students,
          homeworks: persisted.homeworks ?? currentState.homeworks,
          homeworkSubmissions: persisted.homeworkSubmissions ?? currentState.homeworkSubmissions,
          subjects:
            persisted.subjects?.map((subject) => ({
              ...subject,
              lesson: subject.lesson.map((lesson) => ({
                ...lesson,
                questions:
                  lesson.questions && lesson.questions.length >= 10
                    ? lesson.questions
                    : (demoQuestionBanks[subject.id] ?? demoQuestionBanks["sub-1"]).map((question, index) => ({
                        ...question,
                        id: `${lesson.id}-${index + 1}`,
                      })),
              })),
            })) ?? currentState.subjects,
        };
      },
    },
  ),
);
