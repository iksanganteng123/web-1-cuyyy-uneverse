import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle2, ShieldCheck, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      setErrorMessage("Silakan verifikasi terlebih dahulu.");
      return;
    }

    setErrorMessage("");
    if (!login(username, password)) {
      setErrorMessage("Username atau password salah. Periksa kembali data Anda.");
      return;
    }

    const user = useAuthStore.getState().currentUser;
    if (!user) {
      setErrorMessage("Data pengguna tidak tersedia. Silakan coba lagi.");
      return;
    }

    const route =
      user.role === "admin"
        ? "/admin"
        : user.role === "teacher"
          ? "/teacher"
          : "/student/materials";
    navigate(route, { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 flex flex-col lg:flex-row font-sans">
      {/* ================= SEKSI KIRI: FORM LOGIN (RESPONSIF HP/ANDROID & DESKTOP) ================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-5 sm:p-10 lg:p-14 bg-white border-r border-slate-200 shadow-sm">
        {/* Header Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/20">
            <Sun className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg tracking-wide text-slate-900 leading-tight">
              MENTARI
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              Portal E-Learning Terpadu
            </p>
          </div>
        </div>

        {/* Form Isi Login (Presisi di Tengah Layar HP/Android) */}
        <div className="my-auto py-6 w-full max-w-sm sm:max-w-md mx-auto space-y-4 sm:space-y-6">
          <div className="space-y-1.5 text-left">
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat datang di MENTARI,
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Akses mudah ke berbagai layanan digital E-Learning SD. Keamanan
              terjamin, efisiensi waktu, semua dalam satu aplikasi terpadu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Akun kamu
              </label>
              <input
                type="text"
                placeholder="Masukan NISN / NIM / No. Pegawai (contoh: admin)"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMessage("");
                }}
                required
                className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">
                  Kata sandi
                </label>
                <a
                  href="#"
                  className="text-[11px] sm:text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Lupa kata sandi?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukan Kata sandi"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  required
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="text-xs sm:text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            {/* WIDGET CLOUDFLARE TURNSTILE CAPTCHA */}
            <div className="pt-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={captchaVerified}
                onClick={() => setCaptchaVerified((verified) => !verified)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-slate-400 transition-all select-none shadow-sm text-left"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-5 h-5 ${captchaVerified ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {captchaVerified ? "Berhasil!" : "Klik untuk verifikasi"}
                  </span>
                </div>

                <div className="flex flex-col items-end text-[9px] sm:text-[10px] text-slate-500">
                  <div className="flex items-center gap-1 font-bold text-slate-700 tracking-wider">
                    <span className="text-amber-600">CLOUDFLARE</span>
                  </div>
                  <div className="flex gap-1 text-[8px] sm:text-[9px] text-slate-500">
                    <span className="underline hover:text-slate-700">
                      Privasi
                    </span>
                    <span>•</span>
                    <span className="underline hover:text-slate-700">
                      Bantuan
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              className="w-full py-3 sm:py-3.5 rounded-lg font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Masuk Portal
            </button>
          </form>
        </div>

        <div className="text-[10px] sm:text-xs text-slate-500 text-center lg:text-left pt-2">
          &copy; {new Date().getFullYear()} MENTARI E-Learning SD. Integrated
          Security Protected.
        </div>
      </div>

      {/* ================= SEKSI KANAN: BANNER ITACHI UCHIWA (HANYA MUNCUL DI DESKTOP) ================= */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-zinc-950">
        {/* GAMBAR BANNER ITACHI UCHIHA */}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrgJv_dzkrx9L1X3KhWyw38KMsA6PBpGqvkFV8jIr88w&s=10"
          alt="Itachi Uchiha Anime Banner"
          className="w-full h-full object-cover opacity-85 filter brightness-90 hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80";
          }}
        />

        {/* Layer Gradient Overlay Merah khas Tsukuyomi / Itachi */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-red-950/20 to-transparent" />

        {/* Kotak Info Glassmorphism di Atas Gambar */}
        <div className="absolute bottom-12 left-12 right-12 space-y-2 bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-red-900/40 shadow-2xl z-10 text-white">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Genjutsu
            Protection Verified
          </div>
          <h3 className="text-xl font-bold text-white">
            Akatsuki Security Portal MENTARI
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Satu akun terpadu untuk mengakses seluruh fasilitas e-learning
            dengan perlindungan sistem terbaik.
          </p>
        </div>
      </div>
    </div>
  );
}