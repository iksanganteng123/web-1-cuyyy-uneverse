import {
  Sun,
  LogIn,
  BookOpen,
  Award,
  Users,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  const handleGoToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-dvh w-full bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 lg:px-16 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/20">
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-xl tracking-wider text-slate-900 leading-none">
                MENTARI
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-tight">
                E-Learning SD
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#tentang" className="hover:text-emerald-600 transition-colors">
              Tentang Sekolah
            </a>
            <a href="#akademik" className="hover:text-emerald-600 transition-colors">
              Akademik
            </a>
            <a href="#bantuan" className="hover:text-emerald-600 transition-colors">
              Kontak & Bantuan
            </a>
          </nav>

          <button
            onClick={handleGoToLogin}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Portal</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-16 py-8 sm:py-16 flex flex-col justify-center gap-8">
        <div className="space-y-4 text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Academic Portal
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
            Sekolah ramah untuk setiap rasa ingin tahu.
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            SD Mentari menghadirkan pengalaman belajar digital yang ceria,
            terarah, dan mudah diakses langsung dari HP maupun komputer.
          </p>

          <div className="pt-2 w-full sm:w-auto">
            <button
              onClick={handleGoToLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              <span>Buka Portal Sekarang</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg">
              🌱
            </div>
            <h3 className="font-bold text-base text-slate-900">Visi Sekolah</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menumbuhkan generasi yang berkarakter, percaya diri, dan gemar
              belajar.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <h3 className="font-bold text-base text-slate-900">Misi Sekolah</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menyediakan pembelajaran yang inklusif, kreatif, dan mendukung
              perkembangan setiap siswa.
            </p>
          </div>
        </div>

        <div id="akademik" className="pt-6 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">
            Layanan Akademik
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Kurikulum SD
                </h4>
                <p className="text-[11px] text-slate-500">
                  Materi terstruktur per kelas
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Program Kuis
                </h4>
                <p className="text-[11px] text-slate-500">
                  Latihan kuis interaktif
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Jadwal Belajar
                </h4>
                <p className="text-[11px] text-slate-500">Akses jadwal kelas</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        id="bantuan"
        className="bg-slate-900 text-white px-4 sm:px-8 lg:px-16 py-6 border-t border-slate-800"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <span className="font-extrabold tracking-wide text-sm text-emerald-400">
              SD MENTARI
            </span>
            <p className="text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} MENTARI E-Learning SD. All
              rights reserved.
            </p>
          </div>

          <button
            onClick={handleGoToLogin}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            Masuk Portal
          </button>
        </div>
      </footer>
    </div>
  );
}
