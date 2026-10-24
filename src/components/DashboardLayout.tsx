import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Leaderboard } from "./Leaderboard";
import TiltedCard from "./TiltedCard";
import { useAuthStore } from "../store/useAuthStore";
import { useStore } from "../store/useStore";

type MenuItem = {
  label: string;
  href: string;
  icon: "home" | "book" | "calendar" | "quiz" | "chart" | "users" | "notice";
  hasSub?: boolean;
};

const studentMenu: MenuItem[] = [
  { label: "BERANDA", href: "/student", icon: "home" },
  { label: "AKADEMIK", href: "/student/materials", icon: "book", hasSub: true },
  { label: "PRESENSI", href: "/attendance", icon: "calendar" },
  { label: "KUIS", href: "/quizzes", icon: "quiz" },
  { label: "NILAI / RAPOR", href: "/grades", icon: "chart", hasSub: true },
];

const studentMoreMenu: MenuItem[] = [
  { label: "JADWAL PELAJARAN", href: "/schedule", icon: "calendar" },
  { label: "TUGAS & PR", href: "/homework", icon: "quiz" },
  { label: "PROFIL & LENCANA", href: "/profile", icon: "users" },
];

const teacherMenu: MenuItem[] = [
  { label: "BERANDA GURU", href: "/teacher", icon: "home" },
  { label: "AKADEMIK", href: "/teacher/materials", icon: "book", hasSub: true },
  { label: "PRESENSI KELAS", href: "/teacher/attendance", icon: "calendar" },
  { label: "REKAP KUIS", href: "/teacher/quizzes", icon: "quiz" },
  {
    label: "NILAI / RAPOR",
    href: "/teacher/grades",
    icon: "chart",
    hasSub: true,
  },
];

const adminMenu: MenuItem[] = [
  { label: "BERANDA ADMIN", href: "/admin", icon: "home" },
  { label: "MANAJEMEN AKUN", href: "/admin/users", icon: "users" },
  { label: "PENGUMUMAN", href: "/admin/announcements", icon: "notice" },
];

const pageTitles: Record<string, string> = {
  "/student": "Beranda Siswa",
  "/student/materials": "Akademik / Materi",
  "/attendance": "Presensi Kehadiran",
  "/quizzes": "Kuis & Latihan",
  "/grades": "Rapor Mini",
  "/schedule": "Jadwal Pelajaran",
  "/homework": "Tugas & PR",
  "/profile": "Profil & Lencana",
  "/teacher": "Beranda Guru",
  "/teacher/materials": "Materi & Modul",
  "/teacher/attendance": "Presensi Kelas",
  "/teacher/quizzes": "Rekap Kuis",
  "/teacher/grades": "Nilai Rapor",
  "/teacher/schedule": "Jadwal Mengajar",
  "/teacher/homework": "Kelola Tugas",
  "/teacher/announcements": "Pengumuman Sekolah",
  "/admin": "Beranda Admin",
  "/admin/users": "Manajemen Akun",
  "/admin/announcements": "Pengumuman Portal",
};

function MenuIcon({ name }: { name: MenuItem["icon"] }) {
  const paths: Record<MenuItem["icon"], React.ReactNode> = {
    home: (
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
    ),
    book: (
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    ),
    calendar: (
      <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18" />
    ),
    quiz: (
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14h.01 M12 13a2 2 0 0 0 .88-3.68 2.15 2.15 0 0 0-2.38 0A2 2 0 0 0 11 11" />
    ),
    chart: <path d="M18 20V10 M12 20V4 M6 20v-6" />,
    users: (
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />
    ),
    notice: (
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6 shrink-0"
    >
      {paths[name]}
    </svg>
  );
}

function Sidebar({
  sidebarOpen,
  onCloseMobile,
}: {
  sidebarOpen: boolean;
  onCloseMobile: () => void;
}) {
  const user = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const clearSession = useStore((state) => state.logout);
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || !sidebarOpen) return null;

  const menu =
    user.role === "student"
      ? studentMenu
      : user.role === "teacher"
        ? teacherMenu
        : adminMenu;

  const moreMenu = user.role === "student" ? studentMoreMenu : [];

  const initials = user.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "IA";

  const handleLogout = () => {
    logout();
    clearSession();
    navigate("/login", { replace: true });
  };

  const isMenuActive = (href: string) => href === location.pathname;

  return (
    <>
      {/* Overlay Backdrop khusus Mobile */}
      <div
        onClick={onCloseMobile}
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
      />

      {/* SIDEBAR UTAMA */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 flex h-screen w-70 shrink-0 flex-col justify-between overflow-y-auto px-5 py-6 border-r transition-all duration-300 ${
          theme === "dark"
            ? "bg-[#0d1117] text-slate-100 border-zinc-800"
            : "bg-white text-slate-800 border-slate-200"
        }`}
      >
        <div className="space-y-6">
          {/* Header Profil User */}
          <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-slate-200 dark:border-zinc-800">
            <div className="w-24 h-24 rounded-full border-4 border-red-500 flex items-center justify-center bg-emerald-600 text-white font-extrabold text-2xl shadow-md overflow-hidden shrink-0">
              <span>{initials}</span>
            </div>

            <div className="space-y-1 w-full">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide uppercase truncate px-1">
                {user.name || "IKHSAN ASLANI"}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{user.username || "231091700072"}</span>
                <span className="text-emerald-500 font-extrabold text-sm">
                  ✔
                </span>
              </div>
            </div>
          </div>

          {/* List Navigasi Menu */}
          <nav className="space-y-1">
            {menu.map((item) => {
              const active = isMenuActive(item.href);
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MenuIcon name={item.icon} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.hasSub && (
                    <svg
                      className="w-4 h-4 shrink-0 text-slate-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </NavLink>
              );
            })}

            {user.role === "student" && moreMenu.length > 0 && (
              <>
                <div className="pt-3 pb-1">
                  <p className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    LAINNYA
                  </p>
                </div>
                {moreMenu.map((item) => {
                  const active = isMenuActive(item.href);
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onCloseMobile();
                      }}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
                        active
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-zinc-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <MenuIcon name={item.icon} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2.5 mt-6">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">{theme === "dark" ? "🌙" : "☀️"}</span>
              <span>{theme === "dark" ? "Mode Gelap" : "Mode Terang"}</span>
            </span>
            <span
              className={`relative flex h-5 w-9 items-center rounded-full transition-colors ${theme === "dark" ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span
                className={`absolute left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0"}`}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-extrabold text-xs tracking-wider bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition-all cursor-pointer"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-4 h-4"
            >
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            <span>LOGOUT</span>
          </button>

          <p className="text-center text-[10px] font-bold text-slate-400 pt-1">
            &copy; MENTARI E-Learning SD
          </p>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.currentUser);
  const theme = useStore((state) => state.theme);
  const student = useStore((state) =>
    state.user?.role === "student"
      ? state.students.find((item) => item.nim === state.user?.nim)
      : undefined,
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div
      className={`min-h-dvh flex w-full transition-colors duration-200 ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Area Konten Utama (Otomatis Full Screen Saat Sidebar Disembunyikan) */}
      <div className="w-full min-w-0 flex-1 flex flex-col transition-all duration-300">
        {/* Top Header Bar */}
        <header
          className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 sm:px-6 transition-colors ${
            theme === "dark"
              ? "bg-[#0d1117] border-zinc-800 text-white"
              : "bg-white border-slate-200 text-slate-800 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* LOGO GARIS HITAM TIGA SIMPEL */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer active:scale-95"
              title="Buka / Sembunyikan Sidebar Menu"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-6 h-6"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <p className="text-sm sm:text-base font-extrabold tracking-wide uppercase">
              {pageTitles[location.pathname] ?? "Portal MENTARI"}
            </p>
          </div>

          {user?.role === "student" && (
            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-3 py-1.5 text-xs font-black text-amber-800 dark:text-amber-300 transition-all cursor-pointer"
            >
              🔥 {student?.loginStreak ?? 0} · ⚡ {student?.xp ?? 0} XP
            </button>
          )}
        </header>

        {/* Content Body Router */}
        <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <TiltedCard className="w-full max-w-md space-y-4 rounded-3xl border border-indigo-100 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <Leaderboard />
            <button
              type="button"
              onClick={() => setShowLeaderboard(false)}
              className="w-full rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-200 cursor-pointer"
            >
              Tutup Papan Peringkat
            </button>
          </TiltedCard>
        </div>
      )}
    </div>
  );
}
