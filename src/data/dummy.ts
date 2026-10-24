export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content?: string;
  questions?: Question[];
}

export interface Subject {
  id: string;
  title: string;
  category: string;
  description: string;
  grade: number; // <-- TAMBAHKAN INI (Jenjang Kelas 1 s.d. 6)
  lesson: Lesson[];
}

export const dummySubject: Subject[] = [
  {
    id: "sub-1",
    title: "Matematika Kelas 1 (Dasar)",
    category: "matematika",
    description: "Belajar angka dasar dan penjumlahan ringan untuk pemula.",
    grade: 1, // <-- Kelas 1
    lesson: [
      {
        id: "les-1",
        title: "Pengenalan Angka 1 sampai 10",
        duration: "10 menit",
        content: "Materi dasar mengenal angka...",
        questions: [
          {
            id: "q-1",
            question: "Berapa jumlah jari tangan manusia?",
            options: ["5", "10", "15", "20"],
            correctAnswer: "10",
          },
        ],
      },
    ],
  },
  {
    id: "sub-3",
    title: "Bahasa Indonesia Kelas 1",
    category: "bahasa",
    description: "Mengenal huruf, menyusun kata, dan membaca kalimat sederhana.",
    grade: 1,
    lesson: [
      {
        id: "les-3",
        title: "Mengenal Huruf dan Kata",
        duration: "10 menit",
        content: "Belajar mengenali huruf dan menyusun kata sederhana.",
        questions: [
          {
            id: "q-3",
            question: "Huruf apakah yang mengawali kata apel?",
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
          },
        ],
      },
    ],
  },
  {
    id: "sub-4",
    title: "Sains Seru Kelas 1",
    category: "ipa",
    description: "Mengenal hewan, tumbuhan, dan lingkungan di sekitar kita.",
    grade: 1,
    lesson: [
      {
        id: "les-4",
        title: "Bagian Tubuh Hewan",
        duration: "10 menit",
        content: "Mengamati bagian tubuh hewan dan kegunaannya.",
        questions: [
          {
            id: "q-4",
            question: "Hewan apa yang menggunakan sayap untuk terbang?",
            options: ["Ikan", "Burung", "Kucing", "Kelinci"],
            correctAnswer: "Burung",
          },
        ],
      },
    ],
  },
  {
    id: "sub-5",
    title: "Teknologi Dasar Kelas 1",
    category: "teknologi",
    description: "Belajar mengenal komputer dan menggunakan perangkat dengan aman.",
    grade: 1,
    lesson: [
      {
        id: "les-5",
        title: "Mengenal Perangkat Komputer",
        duration: "10 menit",
        content: "Mengenal monitor, papan ketik, dan tetikus.",
        questions: [
          {
            id: "q-5",
            question: "Perangkat apa yang digunakan untuk mengetik?",
            options: ["Monitor", "Papan ketik", "Speaker", "Kamera"],
            correctAnswer: "Papan ketik",
          },
        ],
      },
    ],
  },
  {
    id: "sub-6",
    title: "Matematika Kelas 3",
    category: "matematika",
    description: "Berlatih perkalian dan pembagian sederhana dengan cara menyenangkan.",
    grade: 3,
    lesson: [
      {
        id: "les-6",
        title: "Perkalian Dasar",
        duration: "15 menit",
        content: "Memahami perkalian sebagai penjumlahan berulang.",
        questions: [
          {
            id: "q-6",
            question: "Berapakah hasil dari 4 × 3?",
            options: ["7", "10", "12", "14"],
            correctAnswer: "12",
          },
        ],
      },
    ],
  },
  {
    id: "sub-7",
    title: "Bahasa Indonesia Kelas 3",
    category: "bahasa",
    description: "Membaca cerita pendek dan menemukan informasi penting di dalamnya.",
    grade: 3,
    lesson: [
      {
        id: "les-7",
        title: "Memahami Cerita Pendek",
        duration: "15 menit",
        content: "Belajar menemukan tokoh, tempat, dan kejadian dalam cerita.",
        questions: [
          {
            id: "q-7",
            question: "Tokoh dalam cerita adalah...",
            options: [
              "Orang atau hewan dalam cerita",
              "Judul cerita",
              "Tempat membaca",
              "Nama penulis",
            ],
            correctAnswer: "Orang atau hewan dalam cerita",
          },
        ],
      },
    ],
  },
  {
    id: "sub-8",
    title: "Sains Kelas 3",
    category: "ipa",
    description: "Mengamati perubahan wujud benda dalam kehidupan sehari-hari.",
    grade: 3,
    lesson: [
      {
        id: "les-8",
        title: "Perubahan Wujud Benda",
        duration: "15 menit",
        content: "Mengenal perubahan benda dari padat, cair, dan gas.",
        questions: [
          {
            id: "q-8",
            question: "Es yang mencair berubah menjadi...",
            options: ["Air", "Uap", "Batu", "Salju"],
            correctAnswer: "Air",
          },
        ],
      },
    ],
  },
  {
    id: "sub-2",
    title: "Matematika Kelas 6 (Mahir)",
    category: "matematika",
    description: "Aljabar dan bangun ruang tingkat lanjut.",
    grade: 6, // <-- Kelas 6 (Susah)
    lesson: [
      {
        id: "les-2",
        title: "Rumus Volume Bangun Ruang Kompleks",
        duration: "15 menit",
        content: "Materi lanjutan kelas 6...",
        questions: [
          {
            id: "q-2",
            question: "Apa rumus volume tabung?",
            options: ["pi * r^2 * t", "s * s * s", "p * l * t", "1/3 * p * l"],
            correctAnswer: "pi * r^2 * t",
          },
        ],
      },
    ],
  },
];