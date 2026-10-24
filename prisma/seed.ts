import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const users = [
  {
    username: 'admin',
    name: 'Super Admin',
    password: '040304',
    role: UserRole.ADMIN,
    kelas: null,
  },
  {
    username: 'guru1',
    name: 'Pak Guru',
    password: '123',
    role: UserRole.GURU,
    kelas: '1 SD',
  },
  {
    username: '231091700072',
    name: 'Ikhsan Aslani',
    password: '123',
    role: UserRole.SISWA,
    kelas: '3 SD',
  },
]

async function main() {
  try {
    for (const { password, ...user } of users) {
      const passwordHash = await bcrypt.hash(password, 10)

      await prisma.user.upsert({
        where: { username: user.username },
        update: {
          name: user.name,
          role: user.role,
          kelas: user.kelas,
          ...(user.username === 'admin' ? { passwordHash } : {}),
        },
        create: {
          ...user,
          passwordHash,
        },
      })
    }

    console.log('Seed berhasil: 3 akun awal telah tersedia.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error('Seed gagal:', error)
  process.exitCode = 1
})
