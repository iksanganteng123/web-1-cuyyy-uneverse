import { useStore } from "../store/useStore";
import { LogOut, Crown, Award, Sparkles } from "lucide-react";

export default function Header() {
  const user = useStore((state) => state.user);
  const xp = useStore((state) =>
    state.user?.role === "student"
      ? (state.students.find((student) => student.nim === state.user?.nim)
          ?.xp ?? 0)
      : 0,
  );
  const logout = useStore((state) => state.logout);

  const getLevel = (currentXp: number) => {
    if (currentXp >= 100)
      return {
        title: "Master",
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-200/80",
        iconColor: "text-amber-500",
      };
    if (currentXp >= 50)
      return {
        title: "Menengah",
        color: "text-indigo-600",
        bg: "bg-indigo-50 border-indigo-200/80",
        iconColor: "text-indigo-500",
      };
    return {
      title: "Pemula",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200/80",
      iconColor: "text-emerald-500",
    };
  };

  if (!user) return null;

  const level = getLevel(xp);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Sisi Kiri: Sapaan & Motivasi */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="hidden sm:flex p-2.5 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              Selamat Datang,{" "}
              <span className="text-emerald-600">{user.name}</span>! 👋
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Portal E-Learning SD Mentari • Siap belajar hari ini?
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Profil, Level Badge & Tombol Logout */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-end bg-slate-50/80 sm:bg-transparent p-2 sm:p-0 rounded-2xl border sm:border-0 border-slate-200/60">
          {/* Info Pengguna & Badge */}
          <div className="flex items-center gap-3 text-left px-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-600/20 border border-emerald-400/30">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5 leading-tight">
                {user.name}
                {user.role === "admin" && (
                  <Crown className="w-4 h-4 text-amber-500 fill-amber-500/20 inline" />
                )}
              </span>

              {user.role === "student" ? (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${level.bg} ${level.color} mt-1 w-fit shadow-2xs`}
                >
                  <Award className={`w-3.5 h-3.5 ${level.iconColor}`} />
                  {level.title} • XP: {xp}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/80 mt-1 w-fit shadow-2xs">
                  Administrator
                </span>
              )}
            </div>
          </div>

          {/* Garis Pemisah */}
          <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1"></div>

          {/* Tombol Logout */}
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 border border-slate-200/80 shadow-xs hover:border-rose-200 group"
            title="Keluar Akun"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
