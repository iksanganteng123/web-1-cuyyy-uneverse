import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "../data/dummy";
import { useStore } from "../store/useStore";
import TiltedCard from "./TiltedCard";

const emptyQuestions: Question[] = [];
const quizDurationSeconds = 600;

interface QuizProps {
  lessonId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const Quiz = ({ lessonId, onComplete, onCancel }: QuizProps) => {
  const subjects = useStore((state) => state.subjects);
  const user = useStore((state) => state.user);
  const recordQuizResult = useStore((state) => state.recordQuizResult);
  const currentSubject = subjects.find((subject) =>
    subject.lesson.some((lesson) => lesson.id === lessonId),
  );
  const currentLesson = currentSubject?.lesson.find((lesson) => lesson.id === lessonId);
  const questions = currentLesson?.questions ?? emptyQuestions;

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quizDurationSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const submitHandlerRef = useRef<() => void>(() => undefined);
  const violationCountRef = useRef(0);
  const submittedRef = useRef(false);
  const autoSubmitTriggeredRef = useRef(false);

  const handleSubmitQuiz = useCallback(() => {
    if (submittedRef.current || !currentLesson || !currentSubject || !user || questions.length < 10) return;
    submittedRef.current = true;
    const correct = questions.reduce(
      (count, question) =>
        count + Number(selectedAnswers[question.id] === question.correctAnswer),
      0,
    );
    const finalScore = Math.round((correct / questions.length) * 100);
    setCorrectCount(correct);
    setScore(finalScore);
    setSubmitted(true);
    recordQuizResult({
      studentId: user.nim,
      studentName: user.name,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      subjectId: currentSubject.id,
      subjectTitle: currentSubject.title,
      subjectCategory: currentSubject.category,
      score: finalScore,
      correct,
      total: questions.length,
      xp: finalScore,
    });
  }, [currentLesson, currentSubject, questions, recordQuizResult, selectedAnswers, user]);

  useEffect(() => {
    submitHandlerRef.current = handleSubmitQuiz;
  }, [handleSubmitQuiz]);

  useEffect(() => {
    if (submitted || questions.length < 10) return;

    const handleVisibilityChange = () => {
      if (!document.hidden || submittedRef.current) return;

      const nextViolationCount = violationCountRef.current + 1;
      violationCountRef.current = nextViolationCount;
      setViolationCount(nextViolationCount);
      setWarningOpen(true);

      if (nextViolationCount > 3 && !autoSubmitTriggeredRef.current) {
        autoSubmitTriggeredRef.current = true;
        setAutoSubmitted(true);
        submitHandlerRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [questions.length, submitted]);

  useEffect(() => {
    if (submitted || questions.length < 10) return;
    let remaining = quizDurationSeconds;
    const timer = window.setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      setTimeLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(timer);
        window.setTimeout(() => submitHandlerRef.current(), 0);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [questions.length, submitted]);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  if (!currentLesson || !currentSubject) {
    return (
      <TiltedCard className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-center">
        <p className="font-bold text-slate-600">Materi kuis tidak ditemukan.</p>
        <button onClick={onCancel} className="mt-4 rounded-2xl bg-indigo-600 px-6 py-3 font-black text-white">Kembali</button>
      </TiltedCard>
    );
  }

  if (questions.length < 10) {
    return (
      <TiltedCard className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-8 text-center shadow-[0_5px_0_0_#fde68a]">
        <p className="text-3xl">📝</p>
        <h2 className="mt-2 text-xl font-black text-slate-800">Kuis sedang disiapkan</h2>
        <p className="mt-2 text-sm font-medium text-slate-600">Modul ini perlu minimal 10 soal sebelum siswa dapat memulai kuis.</p>
        <button onClick={onCancel} className="mt-5 rounded-2xl bg-indigo-600 px-6 py-3 font-black text-white">Kembali ke materi</button>
      </TiltedCard>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-12">
      <header className="sticky top-4 z-10 flex items-center justify-between gap-3 rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-[0_4px_0_0_#e2e8f0] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <button onClick={onCancel} className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-black text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">← Batal</button>
        <div className="min-w-0 text-center"><h2 className="truncate text-sm font-black text-slate-800 dark:text-slate-100 sm:text-base">{currentLesson.title}</h2><p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{questions.length} soal · Pilihan ganda</p></div>
        <div className="rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 font-mono text-sm font-black text-amber-900">⏱ {formatTime(timeLeft)}</div>
      </header>

      {!submitted ? (
        <form onSubmit={(event) => { event.preventDefault(); handleSubmitQuiz(); }} className="space-y-4">
          {questions.map((question, questionIndex) => {
            const selected = selectedAnswers[question.id];
            return <TiltedCard as="fieldset" key={question.id} className="space-y-3 rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-[0_4px_0_0_#e2e8f0] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-6">
              <legend className="sr-only">Soal {questionIndex + 1}</legend>
              <div className="flex items-center justify-between gap-2"><span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Soal {questionIndex + 1}</span><span className="text-xs font-bold text-slate-500 dark:text-slate-400">{selected ? "Sudah dijawab" : "Belum dijawab"}</span></div>
              <h3 className="font-black text-slate-800 dark:text-slate-100">{question.question}</h3>
              <div className="space-y-2">{question.options.map((option, optionIndex) => <label key={`${question.id}-${optionIndex}`} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 text-sm transition ${selected === option ? "border-indigo-500 bg-indigo-50 font-black text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-100" : "border-slate-200 font-semibold text-slate-700 hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-slate-800"}`}>
                <input type="radio" name={question.id} value={option} checked={selected === option} onChange={() => setSelectedAnswers((previous) => ({ ...previous, [question.id]: option }))} className="accent-indigo-600" />
                <span className="font-black text-slate-400">{String.fromCharCode(65 + optionIndex)}.</span><span>{option}</span>
              </label>)}</div>
            </TiltedCard>;
          })}
          <button type="submit" className="w-full rounded-2xl border-2 border-emerald-700 bg-emerald-500 py-4 font-black text-white shadow-[0_5px_0_0_#047857] transition hover:bg-emerald-600 active:translate-y-1 active:shadow-none">Kirim Jawaban & Selesaikan Kuis 🎯</button>
        </form>
      ) : (
        <TiltedCard as="section" className="space-y-5 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-[0_6px_0_0_#e2e8f0] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-8">
          <div className="text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl dark:bg-slate-800">🏆</div><h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">Kuis Selesai!</h2><p className="mt-1 font-semibold text-slate-500 dark:text-slate-400">{correctCount} dari {questions.length} jawaban benar</p></div>
          <div className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center dark:border-indigo-900 dark:bg-indigo-950"><p className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Nilai Akhir</p><p className="mt-1 text-4xl font-black text-indigo-700 dark:text-indigo-200">{score}<span className="text-lg text-indigo-400 dark:text-indigo-300"> / 100</span></p><p className="mt-1 font-black text-emerald-700 dark:text-emerald-300">+{score} XP ditambahkan ke profilmu ✨</p></div>
          <div className="space-y-3"><h3 className="font-black">Pembahasan Jawaban</h3>{questions.map((question, index) => {
            const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
            return <article key={question.id} className={`rounded-2xl border-2 p-4 ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}><p className="text-xs font-black uppercase">{isCorrect ? "✅ Benar" : "💡 Pelajari lagi"} · Soal {index + 1}</p><p className="mt-1 font-bold">{question.question}</p><p className="mt-1 text-sm">Jawaban benar: <b>{question.correctAnswer}</b></p>{!isCorrect && selectedAnswers[question.id] && <p className="text-sm">Jawabanmu: {selectedAnswers[question.id]}</p>}<p className="mt-2 text-sm text-slate-600">{question.explanation ?? "Baca kembali materi dan pahami alasan jawaban yang benar."}</p></article>;
          })}</div>
          <button onClick={onComplete} className="w-full rounded-2xl bg-indigo-600 py-3.5 font-black text-white shadow-[0_4px_0_0_#3730a3] transition hover:bg-indigo-700 active:translate-y-1">Selesai & Kembali ke Materi 🚀</button>
        </TiltedCard>
      )}
      {warningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="presentation">
          <TiltedCard
            as="section"
            aria-modal="true"
            aria-labelledby="quiz-warning-title"
            aria-describedby="quiz-warning-message"
            className="w-full max-w-md space-y-4 rounded-3xl border-2 border-rose-300 bg-white p-6 text-center shadow-2xl dark:border-rose-900 dark:bg-slate-900"
            role="alertdialog"
          >
            <div aria-hidden="true" className="text-5xl">⚠️</div>
            <h2 id="quiz-warning-title" className="text-xl font-black text-rose-700 dark:text-rose-300">
              Peringatan! Anda terdeteksi meninggalkan halaman ujian. Jangan curang!
            </h2>
            <p id="quiz-warning-message" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Pelanggaran {violationCount} dari 3.
              {autoSubmitted && " Batas pelanggaran terlampaui; jawaban kuis telah dikirim otomatis."}
            </p>
            <button
              type="button"
              onClick={() => setWarningOpen(false)}
              className="w-full rounded-2xl bg-rose-600 py-3 font-black text-white transition hover:bg-rose-700"
            >
              {autoSubmitted ? "Lihat hasil kuis" : "Saya mengerti"}
            </button>
          </TiltedCard>
        </div>
      )}
    </div>
  );
};

export default Quiz;
