import { PrismaClient } from '@prisma/client';

// Inisialisasi Prisma Client untuk Serverless Environment
let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default async function handler(req, res) {
  // Set Header CORS & JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, username, password, role, kelas } = req.body || {};

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Nama, Username, dan Password wajib diisi!' });
    }

    // Ubah role ke UPPERCASE sesuai Enum Prisma ('ADMIN', 'TEACHER', 'STUDENT')
    const formattedRole = role ? role.toUpperCase() : 'STUDENT';

    // Cek apakah username/NIM sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { username: String(username).trim() },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username / NIM sudah digunakan!' });
    }

    // Simpan ke database Neon
    const newUser = await prisma.user.create({
      data: {
        name: String(name).trim(),
        username: String(username).trim(),
        passwordHash: String(password).trim(), // Jika tanpa hashing
        role: formattedRole,
        kelas: formattedRole === 'ADMIN' ? null : (kelas || '1 SD'),
      },
    });

    return res.status(200).json(newUser);
  } catch (error) {
    console.error('Prisma Error:', error);
    return res.status(500).json({ 
      message: 'Gagal menyimpan ke database server.', 
      errorDetail: error.message 
    });
  }
}