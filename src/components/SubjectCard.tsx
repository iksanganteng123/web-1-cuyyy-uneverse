import { type Subject } from "../data/dummy";
import { useStore } from "../store/useStore";
import TiltedCard from "./TiltedCard";

interface SubjectCardProps {
  subject: Subject;
  onSelect: (subject: Subject) => void;
}

const SubjectCard = ({ subject, onSelect }: SubjectCardProps) => {
  const completedLessonsIds = useStore((state) =>
    state.user?.role === "student"
      ? state.students.find((student) => student.nim === state.user?.nim)
          ?.completedLessonsIds ?? []
      : [],
  );
  const totalLessons = subject.lesson?.length || 0;
  const completedCount =
    subject.lesson?.filter((lesson) =>
      completedLessonsIds.includes(lesson.id),
    ).length || 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <TiltedCard
      as="article"
      className="flex flex-col justify-between rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-[0_6px_0_0_#e2e8f0] transition-shadow hover:shadow-[0_8px_0_0_#cbd5e1]"
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-xl bg-indigo-100 px-3 py-1 text-xs font-black uppercase text-indigo-600">
            {subject.category}
          </span>
          <span className="rounded-xl bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Kelas {subject.grade ?? 1}
          </span>
        </div>

        <h3 className="mt-1 text-xl font-black text-slate-800">
          {subject.title}
        </h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
          {subject.description}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600">
            <span>Progres Belajar</span>
            <span className="text-emerald-600">{progressPercent}%</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full border border-slate-300 bg-slate-200 p-0.5">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => onSelect(subject)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-black text-white shadow-[0_4px_0_0_#059669] transition hover:bg-emerald-600 active:translate-y-1 active:shadow-none"
        >
          <span>MULAI BELAJAR</span>
          <span>🚀</span>
        </button>
      </div>
    </TiltedCard>
  );
};

export default SubjectCard;
