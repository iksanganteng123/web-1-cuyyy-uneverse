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

  // 1. FITUR AMBIL DATA (GET)
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      
      // Mapping passwordHash ke password agar sistem login frontend bisa membaca password-nya
      const formattedUsers = users.map(u => ({
        ...u,
        password: u.passwordHash, // 👈 KUNCI UTAMA AGAR BISA LOGIN DI HP
        role: u.role === 'ADMIN' ? 'admin' : u.role === 'GURU' ? 'teacher' : 'student'
      }));

      return res.status(200).json(formattedUsers);
    } catch (error) {
      return res.status(500).json({ message: `Gagal memuat user: ${error.message}` });
    }
  }

  // 2. FITUR SIMPAN DATA BARU (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { name, username } = body;
      const password = body.password || body.passwordHash;

      let rawRole = body.role;
      if (typeof rawRole === 'object' && rawRole !== null) {
        rawRole = rawRole.value || rawRole.name || '';
      }
      const roleStr = String(rawRole || '').toLowerCase().trim();

      let targetRole = 'SISWA';
      if (roleStr.includes('admin')) {
        targetRole = 'ADMIN';
      } else if (roleStr.includes('teach') || roleStr.includes('guru')) {
        targetRole = 'GURU';
      } else {
        targetRole = 'SISWA';
      }

      const kelas = body.kelas ? (typeof body.kelas === 'object' ? (body.kelas.value || '1 SD') : String(body.kelas)) : '1 SD';

      if (!name || !username || !password) {
        return res.status(400).json({ message: 'Nama, Username, dan Password wajib diisi!' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { username: String(username).trim() },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username / NIM sudah digunakan!' });
      }

      const newUser = await prisma.user.create({
        data: {
          name: String(name).trim(),
          username: String(username).trim(),
          passwordHash: String(password).trim(),
          role: targetRole,
          kelas: targetRole === 'ADMIN' ? null : kelas,
        },
      });

      const responseUser = {
        ...newUser,
        password: newUser.passwordHash,
        role: newUser.role === 'ADMIN' ? 'admin' : newUser.role === 'GURU' ? 'teacher' : 'student'
      };

      return res.status(200).json(responseUser);
    } catch (error) {
      console.error('Prisma Error Detail:', error);
      return res.status(500).json({ 
        message: `Gagal menyimpan: ${error.message}` 
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}