import { useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import type { Question, Subject } from "../data/dummy";
import { useAuthStore } from "../store/useAuthStore";
import {
  useStore,
  type AttendanceStatus,
  type HomeworkSubmission,
  type WeeklySchedule,
} from "../store/useStore";
import TiltedCard from "../components/TiltedCard";

interface QuestionDraft {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const weekdays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const attendanceOptions: AttendanceStatus[] = ["Hadir", "Izin", "Sakit", "Alpa"];
const attendanceStyles: Record<AttendanceStatus, string> = {
  Hadir: "border-emerald-300 bg-emerald-100 text-emerald-800",
  Izin: "border-amber-300 bg-amber-100 text-amber-800",
  Sakit: "border-sky-300 bg-sky-100 text-sky-800",
  Alpa: "border-rose-300 bg-rose-100 text-rose-800",
};
const newQuestion = (): QuestionDraft => ({
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});
const newQuestionList = () => Array.from({ length: 10 }, newQuestion);
const createEntityId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const HomeworkReviewForm = ({
  submission,
  onReview,
}: {
  submission: HomeworkSubmission;
  onReview: (submissionId: string, score: number, feedback: string) => void;
}) => {
  const [score, setScore] = useState(String(submission.score ?? ""));
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
      setError("Nilai harus berupa angka 0 sampai 100.");
      return;
    }
    onReview(submission.id, numericScore, feedback.trim());
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-2 sm:grid-cols-[100px_1fr_auto]">
      <label className="text-xs font-bold text-slate-600">
        Nilai
        <input required type="number" min="0" max="100" value={score} onChange={(event) => setScore(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 p-2 text-sm" />
      </label>
      <label className="text-xs font-bold text-slate-600">
        Feedback
        <input value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Catatan untuk siswa" className="mt-1 w-full rounded-xl border-2 border-slate-200 p-2 text-sm" />
      </label>
      <button className="self-end rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white">Simpan Nilai</button>
      {error && <p role="alert" className="text-xs font-bold text-rose-700 sm:col-span-3">{error}</p>}
    </form>
  );
};

const TeacherDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/")[2] ?? "overview";
  const currentUser = useAuthStore((state) => state.currentUser);
  const students = useStore((state) => state.students);
  const subjects = useStore((state) => state.subjects);
  const addSubject = useStore((state) => state.addSubject);
  const updateSubject = useStore((state) => state.updateSubject);
  const attendance = useStore((state) => state.attendance);
  const setAttendance = useStore((state) => state.setAttendance);
  const schedules = useStore((state) => state.schedules);
  const saveSchedule = useStore((state) => state.saveSchedule);
  const deleteSchedule = useStore((state) => state.deleteSchedule);
  const announcements = useStore((state) => state.announcements);
  const addAnnouncement = useStore((state) => state.addAnnouncement);
  const deleteAnnouncement = useStore((state) => state.deleteAnnouncement);
  const quizResults = useStore((state) => state.quizResults);
  const homeworks = useStore((state) => state.homeworks);
  const homeworkSubmissions = useStore((state) => state.homeworkSubmissions);
  const createHomework = useStore((state) => state.createHomework);
  const reviewHomework = useStore((state) => state.reviewHomework);

  const grade = Number.parseInt(currentUser?.kelas ?? "", 10) || 1;
  const today = localDateKey();
  const classStudents = useMemo(
    () => students.filter((student) => student.grade === grade),
    [students, grade],
  );
  const classSubjects = subjects.filter((subject) => subject.grade === grade);
  const classSchedules = schedules.filter((schedule) => schedule.grade === grade);
  const classResults = quizResults.filter((result) =>
    classStudents.some((student) => student.nim === result.studentId),
  );
  const todaysAttendance = attendance.filter(
    (record) => record.date === today && classStudents.some((student) => student.nim === record.studentId),
  );
  const classHomeworks = homeworks.filter((homework) => homework.grade === grade);
  const classHomeworkSubmissions = homeworkSubmissions.filter((submission) =>
    classHomeworks.some((homework) => homework.id === submission.homeworkId),
  );

  const [message, setMessage] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("matematika");
  const [description, setDescription] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>(newQuestionList);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleDay, setScheduleDay] = useState("Senin");
  const [scheduleSubject, setScheduleSubject] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleRoom, setScheduleRoom] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDescription, setHomeworkDescription] = useState("");
  const [homeworkDueAt, setHomeworkDueAt] = useState("");

  const resetMaterialForm = () => {
    setEditingSubjectId(null);
    setTitle("");
    setCategory("matematika");
    setDescription("");
    setLessonTitle("");
    setLessonContent("");
    setQuestions(newQuestionList());
  };

  const editMaterial = (subject: Subject) => {
    const lesson = subject.lesson[0];
    setEditingSubjectId(subject.id);
    setTitle(subject.title);
    setCategory(subject.category);
    setDescription(subject.description);
    setLessonTitle(lesson?.title ?? "");
    setLessonContent(lesson?.content ?? "");
    setQuestions(
      Array.from({ length: 10 }, (_, index) => {
        const question = lesson?.questions?.[index];
        if (!question) return newQuestion();
        const correctIndex = Math.max(0, question.options.indexOf(question.correctAnswer));
        return {
          question: question.question,
          options: [
            question.options[0] ?? "",
            question.options[1] ?? "",
            question.options[2] ?? "",
            question.options[3] ?? "",
          ],
          correctIndex,
          explanation: question.explanation ?? "",
        };
      }),
    );
  };

  const handleSaveMaterial = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalidIndex = questions.findIndex((question) =>
      !question.question.trim() ||
      question.options.some((option) => !option.trim()) ||
      !question.explanation.trim(),
    );
    if (invalidIndex >= 0 || !currentUser) {
      setMessage(invalidIndex >= 0
        ? `Lengkapi pertanyaan, empat pilihan, dan pembahasan pada soal ${invalidIndex + 1}.`
        : "Sesi guru tidak ditemukan.");
      return;
    }
    const id = editingSubjectId ?? createEntityId("subject");
    const existingSubject = classSubjects.find((subject) => subject.id === editingSubjectId);
    const existingLesson = existingSubject?.lesson[0];
    const lessonQuestions: Question[] = questions.map((draft, index) => ({
      id: existingLesson?.questions?.[index]?.id ?? `${id}-question-${index + 1}`,
      question: draft.question.trim(),
      options: draft.options.map((option) => option.trim()),
      correctAnswer: draft.options[draft.correctIndex].trim(),
      explanation: draft.explanation.trim(),
    }));
    const lesson = {
      id: existingLesson?.id ?? createEntityId("lesson"),
      title: lessonTitle.trim(),
      duration: existingLesson?.duration ?? "20 menit",
      content: lessonContent.trim(),
      questions: lessonQuestions,
    };
    const subject: Subject = {
      id,
      title: title.trim(),
      category,
      description: description.trim(),
      grade,
      lesson: existingSubject
        ? [lesson, ...existingSubject.lesson.slice(1)]
        : [lesson],
    };
    if (existingSubject) updateSubject(subject);
    else addSubject(subject);
    setMessage(`Materi tersimpan dengan ${lessonQuestions.length} soal pilihan ganda.`);
    resetMaterialForm();
  };

  const editSchedule = (schedule: WeeklySchedule) => {
    setEditingScheduleId(schedule.id);
    setScheduleDay(schedule.day);
    setScheduleSubject(schedule.subject);
    setScheduleTime(schedule.time);
    setScheduleRoom(schedule.room);
  };

  const handleSaveSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    saveSchedule({
      id: editingScheduleId ?? createEntityId("schedule"),
      grade,
      day: scheduleDay,
      subject: scheduleSubject.trim(),
      time: scheduleTime,
      room: scheduleRoom.trim(),
      teacherId: currentUser.id,
    });
    setEditingScheduleId(null);
    setScheduleSubject("");
    setScheduleTime("");
    setScheduleRoom("");
    setMessage("Jadwal mingguan berhasil disimpan.");
  };

  const handleAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    addAnnouncement({
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      authorId: currentUser.id,
      authorName: currentUser.name,
    });
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setMessage("Pengumuman berhasil dipublikasikan untuk siswa.");
  };

  const handleCreateHomework = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      setMessage("Sesi guru tidak ditemukan. Silakan masuk kembali.");
      return;
    }
    createHomework({
      title: homeworkTitle.trim(),
      description: homeworkDescription.trim(),
      dueAt: new Date(homeworkDueAt).toISOString(),
      grade,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
    });
    setHomeworkTitle("");
    setHomeworkDescription("");
    setHomeworkDueAt("");
    setMessage("Tugas berhasil dibuat untuk siswa di kelasmu.");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="font-sans text-slate-800">
      <div className="mx-auto max-w-7xl space-y-6">
        {message && <p role="status" className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}

        {activeTab === "overview" && <section id="overview" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Murid", classStudents.length, "bg-sky-100 border-sky-200"],
            ["Modul", classSubjects.length, "bg-violet-100 border-violet-200"],
            ["Jadwal", classSchedules.length, "bg-amber-100 border-amber-200"],
            ["Hasil Kuis", classResults.length, "bg-emerald-100 border-emerald-200"],
          ].map(([label, count, color]) => (
            <TiltedCard key={String(label)} className={`rounded-3xl border-2 p-5 shadow-[0_4px_0_0_rgba(100,116,139,0.18)] ${color}`}>
              <p className="text-sm font-black">{label}</p><p className="mt-2 text-3xl font-black">{count}</p>
            </TiltedCard>
          ))}
        </section>}

        {activeTab === "homework" && <section className="grid gap-6 xl:grid-cols-2">
          <TiltedCard as="section" className="space-y-4 rounded-3xl border-2 border-amber-100 bg-white p-5 shadow-[0_6px_0_0_#fde68a] sm:p-7">
            <div>
              <h2 className="text-xl font-black">📝 Buat Tugas / PR</h2>
              <p className="text-sm font-semibold text-slate-500">Tugas ini akan terlihat oleh semua siswa Kelas {grade}.</p>
            </div>
            <form onSubmit={handleCreateHomework} className="space-y-3">
              <label className="block text-sm font-bold">Judul tugas
                <input required value={homeworkTitle} onChange={(event) => setHomeworkTitle(event.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3" />
              </label>
              <label className="block text-sm font-bold">Deskripsi / instruksi
                <textarea required rows={4} value={homeworkDescription} onChange={(event) => setHomeworkDescription(event.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3" />
              </label>
              <label className="block text-sm font-bold">Batas waktu
                <input required type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={homeworkDueAt} onChange={(event) => setHomeworkDueAt(event.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3" />
              </label>
              <button className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-white shadow-[0_4px_0_0_#b45309] transition hover:bg-amber-600">Terbitkan Tugas</button>
            </form>
            <div className="space-y-2 border-t-2 border-slate-100 pt-4">
              <h3 className="font-black">Tugas Terbit ({classHomeworks.length})</h3>
              {classHomeworks.length === 0 ? <p className="text-sm text-slate-500">Belum ada tugas terbit.</p> : classHomeworks.map((homework) => (
                <article key={homework.id} className="rounded-2xl bg-amber-50 p-3">
                  <p className="font-black">{homework.title}</p>
                  <p className="text-xs text-slate-600">Batas {new Date(homework.dueAt).toLocaleString("id-ID")} · {homeworkSubmissions.filter((item) => item.homeworkId === homework.id).length}/{classStudents.length} pengumpulan</p>
                </article>
              ))}
            </div>
          </TiltedCard>

          <TiltedCard as="section" className="space-y-4 rounded-3xl border-2 border-indigo-100 bg-white p-5 shadow-[0_6px_0_0_#c7d2fe] sm:p-7">
            <div>
              <h2 className="text-xl font-black">📬 Pengumpulan & Penilaian</h2>
              <p className="text-sm font-semibold text-slate-500">{classHomeworkSubmissions.length} jawaban terkumpul untuk kelas ini.</p>
            </div>
            {classHomeworks.length === 0 ? <p className="text-sm text-slate-500">Terbitkan tugas terlebih dahulu untuk menerima jawaban.</p> : classHomeworks.map((homework) => {
              const submissions = classHomeworkSubmissions.filter((item) => item.homeworkId === homework.id);
              return <div key={homework.id} className="space-y-3 rounded-2xl border-2 border-slate-100 p-4">
                <h3 className="font-black">{homework.title}</h3>
                {submissions.length === 0 ? <p className="text-xs text-slate-500">Belum ada siswa yang mengumpulkan.</p> : submissions.map((submission) => (
                  <article key={submission.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-black">{submission.studentName}<span className="ml-2 text-xs font-medium text-slate-500">· {new Date(submission.submittedAt).toLocaleString("id-ID")}</span></p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{submission.answer}</p>
                    <HomeworkReviewForm key={`${submission.id}-${submission.reviewedAt ?? "new"}`} submission={submission} onReview={reviewHomework} />
                  </article>
                ))}
              </div>;
            })}
          </TiltedCard>
        </section>}

        {activeTab === "grades" && <TiltedCard as="section" id="grades" className="space-y-4 rounded-3xl border-2 border-emerald-100 bg-white p-5 shadow-[0_6px_0_0_#a7f3d0] sm:p-7">
          <div><h2 className="text-xl font-black">📊 Rekap Nilai Kelas {grade}</h2><p className="text-sm font-semibold text-slate-500">Ringkasan kuis dan kehadiran seluruh siswa di kelas.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-155 text-left text-sm">
              <thead><tr className="border-b-2 border-slate-100 text-xs uppercase text-slate-500"><th className="py-3 pr-4">Siswa</th><th className="py-3 pr-4">Kuis selesai</th><th className="py-3 pr-4">Rata-rata nilai</th><th className="py-3">Kehadiran</th></tr></thead>
              <tbody>{classStudents.map((student) => {
                const results = classResults.filter((result) => result.studentId === student.nim);
                const records = attendance.filter((record) => record.studentId === student.nim);
                const average = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : null;
                const attendanceRate = records.length ? Math.round((records.filter((record) => record.status === "Hadir").length / records.length) * 100) : null;
                return <tr key={student.id} className="border-b border-slate-100"><td className="py-3 pr-4"><p className="font-black">{student.name}</p><p className="text-xs text-slate-500">{student.nim}</p></td><td className="py-3 pr-4">{results.length}</td><td className="py-3 pr-4 font-black text-indigo-700">{average === null ? "Belum ada nilai" : `${average}/100`}</td><td className="py-3 font-black text-emerald-700">{attendanceRate === null ? "Belum ada catatan" : `${attendanceRate}%`}</td></tr>;
              })}</tbody>
            </table>
          </div>
        </TiltedCard>}

        {activeTab === "attendance" && <TiltedCard as="section" id="attendance" className="space-y-4 rounded-3xl border-2 border-sky-100 bg-white p-5 shadow-[0_6px_0_0_#bae6fd] sm:p-7">
          <div><h2 className="text-xl font-black">📋 Absensi Kelas {grade}</h2><p className="text-sm font-semibold text-slate-500">Catatan harian {new Date().toLocaleDateString("id-ID")}</p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {attendanceOptions.map((status) => <div key={status} className={`rounded-2xl border-2 p-3 ${attendanceStyles[status]}`}><p className="text-xs font-black">{status}</p><p className="text-xl font-black">{todaysAttendance.filter((record) => record.status === status).length}</p></div>)}
          </div>
          {classStudents.map((student) => {
            const status = todaysAttendance.find((record) => record.studentId === student.nim)?.status;
            return <article key={student.id} className="flex flex-col gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-black">{student.name}</p><p className="text-xs font-semibold text-slate-500">{student.nim}</p></div>
              <div className="flex flex-wrap gap-2">{attendanceOptions.map((option) => <button key={option} type="button" aria-pressed={status === option} onClick={() => currentUser && setAttendance({ studentId: student.nim, date: today, status: option, teacherId: currentUser.id })} className={`rounded-xl border-2 px-3 py-2 text-xs font-black transition ${status === option ? attendanceStyles[option] : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"}`}>{option}</button>)}</div>
            </article>;
          })}
          <details className="rounded-2xl border-2 border-slate-100 p-4">
            <summary className="cursor-pointer font-black">Lihat seluruh riwayat absensi ({attendance.filter((record) => classStudents.some((student) => student.nim === record.studentId)).length})</summary>
            <div className="mt-3 space-y-2">{attendance.filter((record) => classStudents.some((student) => student.nim === record.studentId)).map((record) => <p key={`${record.studentId}-${record.date}`} className="text-sm"><b>{classStudents.find((student) => student.nim === record.studentId)?.name}</b> · {record.date} · <span className="font-bold">{record.status}</span></p>)}</div>
          </details>
        </TiltedCard>}

        {activeTab === "materials" && <TiltedCard as="section" id="materials" className="space-y-4 rounded-3xl border-2 border-violet-100 bg-white p-5 shadow-[0_6px_0_0_#ddd6fe] sm:p-7">
            <div><h2 className="text-xl font-black">{editingSubjectId ? "✏️ Edit Materi Kelas" : "📚 Buat Materi Baru"}</h2><p className="text-sm font-semibold text-slate-500">Setiap modul harus memiliki minimal 10 soal beserta kunci dan pembahasan.</p></div>
            <div className="space-y-2">{classSubjects.map((subject) => <div key={subject.id} className="flex items-center justify-between rounded-xl bg-violet-50 p-3"><span className="text-sm font-bold">{subject.title}</span><button type="button" onClick={() => editMaterial(subject)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-violet-700">Edit modul</button></div>)}</div>
            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <label className="block text-sm font-bold">Nama modul<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">Mata pelajaran<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3"><option value="matematika">Matematika</option><option value="bahasa">Bahasa Indonesia</option><option value="ipa">IPA</option><option value="teknologi">Teknologi</option></select></label>
                <label className="text-sm font-bold">Kelas pengampu<input readOnly value={`Kelas ${grade} SD`} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-100 p-3" /></label>
              </div>
              <label className="block text-sm font-bold">Deskripsi modul<textarea required rows={2} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3" /></label>
              <label className="block text-sm font-bold">Judul pelajaran<input required value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3" /></label>
              <label className="block text-sm font-bold">Isi materi<textarea required rows={3} value={lessonContent} onChange={(event) => setLessonContent(event.target.value)} className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3" /></label>
              <div className="space-y-3">
                {questions.map((question, questionIndex) => <fieldset key={questionIndex} className="space-y-2 rounded-2xl border-2 border-slate-100 p-3">
                  <legend className="px-2 text-sm font-black">Soal {questionIndex + 1}</legend>
                  <input required value={question.question} onChange={(event) => setQuestions((previous) => previous.map((item, index) => index === questionIndex ? { ...item, question: event.target.value } : item))} placeholder="Pertanyaan" className="w-full rounded-xl border-2 border-slate-200 p-2.5 text-sm" />
                  <div className="grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={optionIndex} className="flex items-center gap-2 text-xs font-bold"><span>{String.fromCharCode(65 + optionIndex)}.</span><input required value={option} onChange={(event) => setQuestions((previous) => previous.map((item, index) => index === questionIndex ? { ...item, options: item.options.map((choice, choiceIndex) => choiceIndex === optionIndex ? event.target.value : choice) as QuestionDraft["options"] } : item))} placeholder={`Pilihan ${String.fromCharCode(65 + optionIndex)}`} className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 p-2" /></label>)}</div>
                  <div className="grid gap-2 sm:grid-cols-2"><label className="text-xs font-bold">Kunci jawaban<select value={question.correctIndex} onChange={(event) => setQuestions((previous) => previous.map((item, index) => index === questionIndex ? { ...item, correctIndex: Number(event.target.value) } : item))} className="mt-1 w-full rounded-xl border-2 border-slate-200 p-2">{question.options.map((_, optionIndex) => <option key={optionIndex} value={optionIndex}>{String.fromCharCode(65 + optionIndex)}</option>)}</select></label><input required value={question.explanation} onChange={(event) => setQuestions((previous) => previous.map((item, index) => index === questionIndex ? { ...item, explanation: event.target.value } : item))} placeholder="Pembahasan jawaban" className="self-end rounded-xl border-2 border-slate-200 p-2 text-xs" /></div>
                </fieldset>)}
              </div>
              <div className="flex gap-2"><button className="flex-1 rounded-2xl bg-violet-600 p-3 font-black text-white shadow-[0_4px_0_0_#5b21b6] active:translate-y-1">{editingSubjectId ? "Simpan Perubahan" : "Terbitkan Modul + 10 Soal"}</button>{editingSubjectId && <button type="button" onClick={resetMaterialForm} className="rounded-xl bg-slate-100 px-4 font-bold">Batal</button>}</div>
            </form>
          </TiltedCard>}

          {activeTab === "schedule" && <TiltedCard as="section" className="space-y-4 rounded-3xl border-2 border-amber-100 bg-white p-5 shadow-[0_6px_0_0_#fde68a] sm:p-7">
              <h2 className="text-xl font-black">🗓️ Jadwal Mingguan Kelas {grade}</h2>
              <form onSubmit={handleSaveSchedule} className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">Hari<select value={scheduleDay} onChange={(event) => setScheduleDay(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3">{weekdays.map((day) => <option key={day}>{day}</option>)}</select></label>
                <label className="text-sm font-bold">Mata pelajaran<input required value={scheduleSubject} onChange={(event) => setScheduleSubject(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3" /></label>
                <label className="text-sm font-bold">Waktu<input required type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3" /></label>
                <label className="text-sm font-bold">Ruang<input required value={scheduleRoom} onChange={(event) => setScheduleRoom(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3" /></label>
                <button className="rounded-xl bg-amber-500 p-3 font-black text-white sm:col-span-2">{editingScheduleId ? "Simpan Jadwal" : "Tambah Jadwal"}</button>
              </form>
              <div className="space-y-2">{classSchedules.sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day) || a.time.localeCompare(b.time)).map((schedule) => <article key={schedule.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 p-3"><div><p className="font-black">{schedule.day} · {schedule.subject}</p><p className="text-xs font-semibold text-slate-500">{schedule.time} · {schedule.room}</p></div><div className="flex gap-2"><button type="button" onClick={() => editSchedule(schedule)} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-black">Edit</button><button type="button" onClick={() => deleteSchedule(schedule.id)} className="rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-black text-rose-700">Hapus</button></div></article>)}</div>
            </TiltedCard>}

            {activeTab === "quizzes" && <TiltedCard as="section" id="quiz-results" className="space-y-4 rounded-3xl border-2 border-emerald-100 bg-white p-5 shadow-[0_6px_0_0_#a7f3d0] sm:p-7">
              <h2 className="text-xl font-black">📊 Rekap Nilai Kuis</h2>
              {classResults.length === 0 && <p className="text-sm font-medium text-slate-500">Belum ada siswa menyelesaikan kuis.</p>}
              <div className="max-h-80 space-y-2 overflow-y-auto">{classResults.map((result) => <article key={result.id} className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 p-3"><div><p className="font-black">{result.studentName}</p><p className="text-xs font-semibold text-slate-500">{result.subjectTitle} · {result.lessonTitle}</p><p className="text-xs text-slate-500">{new Date(result.completedAt).toLocaleString("id-ID")}</p></div><div className="text-right"><p className="text-lg font-black text-emerald-700">{result.score}</p><p className="text-xs font-bold">{result.correct}/{result.total} benar · +{result.xp} XP</p></div></article>)}</div>
            </TiltedCard>}

            {activeTab === "announcements" && <TiltedCard as="section" className="space-y-4 rounded-3xl border-2 border-indigo-100 bg-white p-5 shadow-[0_6px_0_0_#c7d2fe] sm:p-7">
              <h2 className="text-xl font-black">📣 Pengumuman untuk Siswa</h2>
              <form onSubmit={handleAnnouncement} className="space-y-3"><input required value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} placeholder="Judul pengumuman" className="w-full rounded-xl border-2 border-slate-200 p-3" /><textarea required rows={3} value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} placeholder="Isi informasi untuk kelas..." className="w-full rounded-xl border-2 border-slate-200 p-3" /><button className="rounded-xl bg-indigo-600 px-4 py-3 font-black text-white">Publikasikan</button></form>
              {announcements.map((item) => <article key={item.id} className="rounded-xl bg-indigo-50 p-3"><div className="flex justify-between gap-2"><p className="font-black">{item.title}</p><button type="button" onClick={() => deleteAnnouncement(item.id)} className="text-xs font-bold text-rose-700">Hapus</button></div><p className="mt-1 whitespace-pre-wrap text-sm">{item.message}</p><p className="mt-2 text-xs text-slate-500">{item.authorName}</p></article>)}
            </TiltedCard>}
      </div>
    </motion.div>
  );
};

export default TeacherDashboard;
