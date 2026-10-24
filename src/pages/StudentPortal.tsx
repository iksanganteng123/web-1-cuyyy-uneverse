import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import TiltedCard from "../components/TiltedCard";

const cardStyle =
  "rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-[0_5px_0_0_#e2e8f0] sm:p-7 overflow-hidden break-words";

/* ==========================================================================
   1. HALAMAN TUGAS & PEKERJAAN RUMAH (HOMEWORK PAGE)
   ========================================================================== */
const StudentHomeworkPage = () => {
  const user = useStore((state) => state.user);
  const homeworks = useStore((state) => state.homeworks);
  const submissions = useStore((state) => state.homeworkSubmissions);
  const submitHomework = useStore((state) => state.submitHomework);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  if (!user) return null;

  const assignments = homeworks
    .filter((homework) => homework.grade === user.grade)
    .sort((first, second) => first.dueAt.localeCompare(second.dueAt));

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
    homeworkId: string,
  ) => {
    event.preventDefault();
    const answer = answers[homeworkId]?.trim();
    if (!answer) {
      setMessage("Tuliskan jawaban atau catatan pengerjaan terlebih dahulu.");
      return;
    }
    submitHomework({
      homeworkId,
      studentId: user.nim,
      studentName: user.name,
      answer,
    });
    setMessage("Jawaban tugas berhasil dikirim kepada guru.");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <TiltedCard className={cardStyle}>
        <header>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
            MENTARI · Kelas {user.grade}
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-800">
            Tugas & Pekerjaan Rumah 📝
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Baca instruksi, tulis jawaban, lalu kirim sebelum batas waktu.
          </p>
        </header>
      </TiltedCard>

      {message && (
        <p
          role="status"
          className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 transition-all"
        >
          {message}
        </p>
      )}

      {assignments.length === 0 ? (
        <TiltedCard className={`${cardStyle} text-center py-10`}>
          <p className="text-4xl">🎒</p>
          <p className="mt-2 font-black text-slate-700">
            Belum ada tugas untuk kelasmu.
          </p>
        </TiltedCard>
      ) : (
        assignments.map((homework) => {
          const submission = submissions.find(
            (item) =>
              item.homeworkId === homework.id && item.studentId === user.nim,
          );
          return (
            <TiltedCard key={homework.id} className={`${cardStyle} space-y-4`}>
              <article className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">
                      {homework.title}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Dari {homework.teacherName}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-800">
                    Batas: {new Date(homework.dueAt).toLocaleString("id-ID")}
                  </span>
                </div>

                <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 border border-slate-100">
                  {homework.description}
                </p>

                {submission ? (
                  <div className="space-y-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
                      Jawaban terkirim ·{" "}
                      {new Date(submission.submittedAt).toLocaleString("id-ID")}
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                      {submission.answer}
                    </p>
                    {submission.score !== undefined && (
                      <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-xs">
                        <p className="font-black text-indigo-700">
                          Nilai: {submission.score}/100
                        </p>
                        {submission.feedback && (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                            Feedback: {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={(event) => handleSubmit(event, homework.id)}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-bold text-slate-700">
                      Jawaban / catatan pengerjaan
                      <textarea
                        required
                        rows={4}
                        value={answers[homework.id] ?? ""}
                        onChange={(event) =>
                          setAnswers((previous) => ({
                            ...previous,
                            [homework.id]: event.target.value,
                          }))
                        }
                        placeholder="Tulis jawabanmu di sini..."
                        className="mt-1.5 w-full rounded-2xl border-2 border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </label>
                    <button className="w-full sm:w-auto rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-[0_4px_0_0_#3730a3] transition hover:bg-indigo-700 active:translate-y-0.5 active:shadow-none cursor-pointer">
                      Kirim Jawaban 🚀
                    </button>
                  </form>
                )}
              </article>
            </TiltedCard>
          );
        })
      )}
    </motion.section>
  );
};

/* ==========================================================================
   2. HALAMAN RAPOR MINI (GRADEBOOK PAGE)
   ========================================================================== */
const StudentGradebookPage = () => {
  const user = useStore((state) => state.user);
  const quizResults = useStore((state) => state.quizResults);
  const attendance = useStore((state) => state.attendance);

  if (!user) return null;

  const results = quizResults
    .filter((result) => result.studentId === user.nim)
    .sort((first, second) =>
      second.completedAt.localeCompare(first.completedAt),
    );

  const attendanceRecords = attendance.filter(
    (record) => record.studentId === user.nim,
  );

  const attended = attendanceRecords.filter(
    (record) => record.status === "Hadir",
  ).length;

  const average = results.length
    ? Math.round(
        results.reduce((sum, result) => sum + result.score, 0) / results.length,
      )
    : null;

  const attendanceRate = attendanceRecords.length
    ? Math.round((attended / attendanceRecords.length) * 100)
    : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <TiltedCard className={cardStyle}>
        <header>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
            MENTARI · Kelas {user.grade}
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-800">
            Rapor Mini Saya 📊
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Rekap nilai kuis dan catatan kehadiranmu.
          </p>
        </header>
      </TiltedCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <TiltedCard
          id="grades"
          className="scroll-mt-24 rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5 shadow-xs"
        >
          <p className="text-xs font-black uppercase text-indigo-600">
            Rata-rata kuis
          </p>
          <p className="mt-2 text-3xl font-black text-indigo-800">
            {average === null ? "—" : `${average}/100`}
          </p>
        </TiltedCard>

        <TiltedCard
          id="attendance"
          className="scroll-mt-24 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5 shadow-xs"
        >
          <p className="text-xs font-black uppercase text-emerald-700">
            Kehadiran
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-800">
            {attendanceRate === null ? "—" : `${attendanceRate}%`}
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            {attended} hadir dari {attendanceRecords.length} catatan
          </p>
        </TiltedCard>

        <TiltedCard className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 shadow-xs">
          <p className="text-xs font-black uppercase text-amber-700">
            Kuis selesai
          </p>
          <p className="mt-2 text-3xl font-black text-amber-800">
            {results.length}
          </p>
        </TiltedCard>
      </div>

      <section className={`${cardStyle} space-y-4`}>
        <h2 className="text-lg font-black text-slate-800">
          Riwayat Nilai Kuis
        </h2>
        {results.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">
            Nilai kuis akan muncul setelah kamu menyelesaikan kuis.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-125 text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100 text-xs font-bold uppercase text-slate-400">
                  <th className="py-3 pr-4">Tanggal</th>
                  <th className="py-3 pr-4">Mata pelajaran</th>
                  <th className="py-3 pr-4">Materi</th>
                  <th className="py-3 pr-4">Benar</th>
                  <th className="py-3">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result) => (
                  <tr
                    key={result.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pr-4 text-slate-600">
                      {new Date(result.completedAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-slate-800">
                      {result.subjectTitle}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">
                      {result.lessonTitle}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">
                      {result.correct}/{result.total}
                    </td>
                    <td className="py-3.5 font-black text-indigo-700">
                      {result.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="pt-2 text-xs font-medium text-slate-400 border-t border-slate-100">
          Persentase kehadiran dihitung dari catatan absensi yang telah diisi
          guru.
        </p>
      </section>
    </motion.section>
  );
};

/* ==========================================================================
   3. HALAMAN PROFIL SISWA (PROFILE PAGE)
   ========================================================================== */
const StudentProfilePage = () => {
  const user = useStore((state) => state.user);
  const student = useStore((state) =>
    state.students.find((item) => item.nim === state.user?.nim),
  );

  if (!user || !student) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header className={cardStyle}>
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
          MENTARI · Profil Siswa
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-800">
          {user.name} 🌟
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Kelas {user.grade} · {student.xp} XP · Streak login{" "}
          {student.loginStreak} hari
        </p>
      </header>

      <section className={cardStyle}>
        <h2 className="mb-4 text-lg font-black text-slate-800">
          Lencana Prestasi 🏅
        </h2>
        {student.badges.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-500">
            Belum ada lencana. Selesaikan kuis dengan nilai sempurna atau login
            tiga hari berturut-turut!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {student.badges.map((badge) => (
              <article
                key={badge.id}
                className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 shadow-xs"
              >
                <span className="text-3xl" aria-hidden="true">
                  {badge.icon}
                </span>
                <h3 className="mt-2 font-black text-amber-900">
                  {badge.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {badge.description}
                </p>
                <p className="mt-3 text-[11px] font-bold text-slate-400">
                  Diraih{" "}
                  {new Date(badge.unlockedAt).toLocaleDateString("id-ID")}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </motion.section>
  );
};

/* ==========================================================================
   4. HALAMAN PRESENSI (ATTENDANCE PAGE)
   ========================================================================== */
const StudentAttendancePage = () => {
  const user = useStore((state) => state.user);
  const attendance = useStore((state) => state.attendance);

  if (!user) return null;

  const records = attendance
    .filter((record) => record.studentId === user.nim)
    .sort((first, second) => second.date.localeCompare(first.date));

  const statusStyles: Record<string, string> = {
    Hadir: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Izin: "bg-amber-50 text-amber-700 ring-amber-200",
    Sakit: "bg-sky-50 text-sky-700 ring-sky-200",
    Alpa: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header className={cardStyle}>
        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
          MENTARI · Kelas {user.grade}
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-800">
          Presensi Saya
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Riwayat kehadiran yang dicatat oleh guru.
        </p>
      </header>

      <section className={`${cardStyle} space-y-3`}>
        {records.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">
            Belum ada catatan presensi untuk ditampilkan.
          </p>
        ) : (
          records.map((record) => (
            <TiltedCard
              key={`${record.date}-${record.studentId}`}
              className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4"
            >
              <article className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-slate-800">
                    {new Date(`${record.date}T00:00:00`).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Catatan presensi kelas {user.grade}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3.5 py-1 text-xs font-black ring-1 ${
                    statusStyles[record.status] ??
                    "bg-slate-100 text-slate-700 ring-slate-200"
                  }`}
                >
                  {record.status}
                </span>
              </article>
            </TiltedCard>
          ))
        )}
      </section>
    </motion.section>
  );
};

/* ==========================================================================
   5. HALAMAN KUIS & LATIHAN (QUIZ PAGE)
   ========================================================================== */
const StudentQuizPage = () => {
  const user = useStore((state) => state.user);
  const subjects = useStore((state) => state.subjects);
  const results = useStore((state) => state.quizResults);
  const navigate = useNavigate();

  if (!user) return null;

  const gradeSubjects = subjects.filter(
    (subject) => subject.grade === user.grade,
  );

  const studentResults = results
    .filter((result) => result.studentId === user.nim)
    .sort((first, second) =>
      second.completedAt.localeCompare(first.completedAt),
    );

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header className={cardStyle}>
        <p className="text-xs font-black uppercase tracking-widest text-sky-600">
          MENTARI · Kelas {user.grade}
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-800">
          Kuis & Latihan
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Pilih materi untuk membuka latihan, atau tinjau hasil kuis terakhirmu.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {gradeSubjects.map((subject) => (
          <TiltedCard
            key={subject.id}
            className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-[0_4px_0_0_#e2e8f0] flex flex-col justify-between"
          >
            <article className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                {subject.category}
              </p>
              <h2 className="text-lg font-black text-slate-800">
                {subject.title}
              </h2>
              <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed">
                {subject.description}
              </p>
            </article>

            <button
              type="button"
              onClick={() => navigate(`/subjects/${subject.id}`)}
              className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98] cursor-pointer"
            >
              Buka materi & kuis
            </button>
          </TiltedCard>
        ))}

        {gradeSubjects.length === 0 && (
          <p
            className={`${cardStyle} text-sm font-semibold text-slate-500 sm:col-span-2 xl:col-span-3 text-center py-8`}
          >
            Belum ada kuis yang tersedia untuk kelasmu.
          </p>
        )}
      </section>

      <section className={`${cardStyle} space-y-4`}>
        <h2 className="text-lg font-black text-slate-800">
          Hasil kuis terbaru
        </h2>
        {studentResults.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">
            Hasil kuis akan muncul setelah kamu menyelesaikan latihan.
          </p>
        ) : (
          <div className="space-y-2.5">
            {studentResults.slice(0, 5).map((result) => (
              <TiltedCard
                key={result.id}
                className="rounded-2xl bg-slate-50 p-4 border border-slate-100"
              >
                <article className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">
                      {result.lessonTitle}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {result.subjectTitle} ·{" "}
                      {new Date(result.completedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className="rounded-xl bg-emerald-100 px-3.5 py-1.5 text-sm font-black text-emerald-800 shadow-xs">
                    {result.score}/100
                  </span>
                </article>
              </TiltedCard>
            ))}
          </div>
        )}
      </section>
    </motion.section>
  );
};

export {
  StudentAttendancePage,
  StudentGradebookPage,
  StudentHomeworkPage,
  StudentProfilePage,
  StudentQuizPage,
};
