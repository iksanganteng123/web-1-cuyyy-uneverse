import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, username, password, role, kelas } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
    }

    // Cek apakah username/NIM sudah terdaftar di database Neon
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username / NIM sudah digunakan!' });
    }

    // Simpan akun baru ke tabel User Neon DB
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash: password,
        role: role ? role.toUpperCase() : 'STUDENT',
        kelas: role === 'admin' ? null : kelas,
      },
    });

    return res.status(200).json(newUser);
  } catch (error) {
    console.error('Error in /api/users:', error);
    return res.status(500).json({ message: 'Gagal menyimpan ke database server.' });
  } finally {
    await prisma.$disconnect();
  }
}