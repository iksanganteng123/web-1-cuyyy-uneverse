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
    const body = req.body || {};
    const name = body.name;
    const username = body.username;
    const password = body.password;
    
    // Amankan pengambilan role (bisa berupa string atau objek dari form)
    let rawRole = body.role;
    if (typeof rawRole === 'object' && rawRole !== null) {
      rawRole = rawRole.value || rawRole.name || 'student';
    }
    const roleStr = String(rawRole || 'student').toLowerCase().trim();

    // Format role menjadi PascalCase sesuai standar Prisma Enum (Student, Teacher, Admin)
    let formattedRole = 'Student';
    if (roleStr.includes('admin')) {
      formattedRole = 'Admin';
    } else if (roleStr.includes('teach') || roleStr.includes('guru')) {
      formattedRole = 'Teacher';
    } else {
      formattedRole = 'Student';
    }

    const kelas = body.kelas ? (typeof body.kelas === 'object' ? (body.kelas.value || '1 SD') : String(body.kelas)) : '1 SD';

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Nama, Username, dan Password wajib diisi!' });
    }

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
        kelas: formattedRole === 'Admin' ? null : kelas,
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