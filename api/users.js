import { PrismaClient } from '@prisma/client';

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
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, username, password, role, kelas } = req.body || {};

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Nama, Username, dan Password wajib diisi!' });
    }

    // Ubah role ke lowercase agar sesuai dengan Enum Prisma di database
    const formattedRole = role ? String(role).toLowerCase().trim() : 'student';

    // Cek apakah username/NIM sudah terdaftar di database Neon
    const existingUser = await prisma.user.findUnique({
      where: { username: String(username).trim() },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username / NIM sudah digunakan!' });
    }

    // Simpan akun baru ke tabel User Neon DB
    const newUser = await prisma.user.create({
      data: {
        name: String(name).trim(),
        username: String(username).trim(),
        passwordHash: String(password).trim(),
        role: formattedRole,
        kelas: formattedRole === 'admin' ? null : (kelas || '1 SD'),
      },
    });

    return res.status(200).json(newUser);
  } catch (error) {
    console.error('Prisma Error Detail:', error);
    return res.status(500).json({ 
      message: `Gagal menyimpan: ${error.message}` 
    });
  }
}