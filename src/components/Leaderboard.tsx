import { useStore } from "../store/useStore";
import TiltedCard from "./TiltedCard";

export const Leaderboard = () => {
  const students = useStore((state) => state.students);
  const currentUser = useStore((state) => state.user);
  const rankedStudents = [...students].sort((first, second) => second.xp - first.xp);

  return (
    <section className="space-y-4" aria-label="Papan peringkat siswa">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-800">🏆 Papan Peringkat</h2>
        <span className="rounded-xl bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">XP siswa</span>
      </header>
      {rankedStudents.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">Belum ada siswa terdaftar.</p>
      ) : (
        <ol className="space-y-2">
          {rankedStudents.slice(0, 10).map((student, index) => {
            const isCurrentStudent = student.nim === currentUser?.nim;
            return (
              <TiltedCard as="li" key={student.id} className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-3 ${isCurrentStudent ? "border-emerald-300 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`w-7 shrink-0 text-center font-black ${index === 0 ? "text-amber-500" : "text-slate-500"}`}>#{index + 1}</span>
                  <span className="text-2xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎒"}</span>
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-800">{student.name}{isCurrentStudent ? " (Saya)" : ""}</p>
                    <p className="text-xs font-semibold text-slate-500">Kelas {student.grade}</p>
                  </div>
                </div>
                <p className="shrink-0 font-black text-indigo-700">{student.xp} <span className="text-xs">XP</span></p>
              </TiltedCard>
            );
          })}
        </ol>
      )}
    </section>
  );
};
