import { useState } from "react";
import type { Subject } from "../data/dummy";
import { useStore } from "../store/useStore";
import TiltedCard from "../components/TiltedCard";
import ThoughtLine from "../components/ThoughtLine";

interface SubjectDetailProps {
  subject: Subject;
  onBack: () => void;
  onLessonSelect: (lessonId: string) => void;
}

const SubjectDetail = ({ subject, onBack, onLessonSelect }: SubjectDetailProps) => {
  const completedLessonsIds = useStore((state) =>
    state.user?.role === "student"
      ? state.students.find((student) => student.nim === state.user?.nim)?.completedLessonsIds ?? []
      : [],
  );

  // Modals untuk Tanya AI
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasAskedAI, setHasAskedAI] = useState(false);

  // FUNGSI UTAMA: Menggunakan Header X-goog-api-key untuk AQ. Token
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setHasAskedAI(true);
    setIsAiLoading(true);
    setAiAnswer("");

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        setAiAnswer(
          "⚠️ API Key belum terdeteksi di file .env. Pastikan VITE_GEMINI_API_KEY sudah terisi!",
        );
        setIsAiLoading(false);
        return;
      }

      // Endpoint v1beta dengan model gemini-flash-latest
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey, // Mengirim token AQ. via Header X-goog-api-key
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Bertindaklah sebagai Tutor AI yang ramah, seru, dan edukatif khusus untuk anak Sekolah Dasar (SD). Jelaskan dengan bahasa yang sangat sederhana, ceria, dan mudah dipahami anak-anak. JANGAN gunakan tanda bintang atau format markdown seperti **bold**. Pertanyaan tentang materi "${subject.title}": ${aiQuery}`,
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();
      console.log("Respon Gemini:", data);

      if (data.error) {
        setAiAnswer(
          `⚠️ Kendala Gemini: ${data.error.message || "Token tidak valid."}`,
        );
        return;
      }

      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Maaf, AI belum bisa menjawab pertanyaan tersebut. Coba tanyakan lagi ya!";

      setAiAnswer(reply);
    } catch (error) {
      console.error("Fetch error:", error);
      setAiAnswer(
        "Terjadi kesalahan koneksi ke server AI. Cek jaringan internetmu.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Top Header Navigation */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0]">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl border border-slate-300 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-0.5 transition text-sm flex items-center gap-2 cursor-pointer"
        >
          <span>←</span> Kembali
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-slate-800">{subject.title}</h1>
          <p className="text-xs text-indigo-600 font-extrabold">
            Kelas {subject.grade} SD
          </p>
        </div>
        <button
          onClick={() => setShowAIModal(true)}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-2xl shadow-[0_3px_0_0_#4338ca] text-xs flex items-center gap-1.5 active:translate-y-0.5 cursor-pointer"
        >
          🤖 Tanya AI
        </button>
      </div>

      {/* Banner Utama Modul */}
      <TiltedCard className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-3xl text-white shadow-[0_6px_0_0_#3730a3] border-2 border-indigo-400">
        <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-black uppercase tracking-wider">
          {subject.category}
        </span>
        <h2 className="text-3xl font-black mt-2">{subject.title}</h2>
        <p className="mt-2 text-indigo-100 text-sm max-w-xl font-medium">
          {subject.description}
        </p>
      </TiltedCard>

      {/* Jalur Belajar Ala Duolingo (Peta Node) */}
      <TiltedCard className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#e2e8f0] text-center space-y-8">
        <h3 className="text-xl font-black text-slate-800">
          🗺️ Peta Jalur Misi Belajar
        </h3>

        <div className="flex flex-col items-center space-y-10 relative">
          {subject.lesson.map((les, index) => {
            const isCompleted = completedLessonsIds.includes(les.id);
            const isZigZagRight = index % 2 === 1;

            return (
              <div
                key={les.id}
                className={`flex flex-col items-center relative transition-transform hover:scale-105 ${
                  isZigZagRight ? "md:translate-x-12" : "md:-translate-x-12"
                }`}
              >
                {/* Garis Penghubung antar Bab */}
                {index < subject.lesson.length - 1 && (
                  <div className="w-2 h-12 bg-slate-300 absolute -bottom-10 z-0 rounded-full" />
                )}

                {/* Tombol Misi / Bab Node */}
                <button
                  onClick={() => onLessonSelect(les.id)}
                  className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl z-10 border-4 shadow-[0_6px_0_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-none transition cursor-pointer ${
                    isCompleted
                      ? "bg-amber-400 border-amber-500 text-amber-900 shadow-[0_6px_0_0_#d97706]"
                      : "bg-emerald-500 border-emerald-600 text-white shadow-[0_6px_0_0_#059669]"
                  }`}
                >
                  {isCompleted ? "⭐" : index + 1}
                </button>

                <div className="mt-3 bg-slate-50 border-2 border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center">
                  <p className="font-extrabold text-sm text-slate-800">
                    {les.title}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">
                    ⏱️ {les.duration}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </TiltedCard>

      {/* Modal Dialog AI Assistant */}
      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <TiltedCard className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-indigo-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <span>🤖</span> Asisten AI Belajar SD
              </h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAskAI} className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">
                Tanyakan penjelasan atau contoh soal tentang {subject.title}:
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Berapa hasil 1 + 1..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-2xl text-sm focus:border-indigo-500 focus:outline-none font-medium"
                required
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-[0_4px_0_0_#3730a3] text-sm active:translate-y-1 transition disabled:opacity-50 cursor-pointer"
              >
                {isAiLoading
                  ? "Gemini Sedang Berpikir... 💭"
                  : "Kirim Pertanyaan Ke AI 🚀"}
              </button>
            </form>

            {hasAskedAI && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-indigo-700">
                <ThoughtLine
                  working={isAiLoading}
                  steps={["Menghubungi asisten AI"]}
                  label="Asisten AI sedang menyiapkan jawaban…"
                  doneLabel="Jawaban disiapkan dalam"
                  glyph="sparkle"
                  fontSize={14}
                  showTimer
                  renderLabel={(text) =>
                    text.replace(/\bminutes\b/g, "menit").replace(/\bseconds\b/g, "detik")
                  }
                />
              </div>
            )}

            {aiAnswer && (
              <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-sm text-indigo-900 leading-relaxed font-medium whitespace-pre-line max-h-60 overflow-y-auto">
                {aiAnswer}
              </div>
            )}
          </TiltedCard>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
