import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useStore } from "./store/useStore";
import { useAuthStore, type Role } from "./store/useAuthStore";
import Login from "./components/Login";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import SubjectCard from "./components/SubjectCard";
import CircularCarousel from "./components/CircularCarousel";
import TiltedCard from "./components/TiltedCard";
import Quiz from "./components/Quiz";
import SubjectDetail from "./pages/SubjectDetail";
import PublicLanding from "./pages/PublicLanding";
import { motion } from "framer-motion";
import {
  StudentGradebookPage,
  StudentAttendancePage,
  StudentHomeworkPage,
  StudentProfilePage,
  StudentQuizPage,
} from "./pages/StudentPortal";

function App() {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<EntryRedirect />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<RequireRole role="student" />}>
        <Route element={<DashboardLayout />}>
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/student/materials" element={<StudentDashboard />} />
            <Route path="/schedule" element={<StudentDashboard />} />
            <Route path="/attendance" element={<StudentAttendancePage />} />
            <Route path="/quizzes" element={<StudentQuizPage />} />
            <Route path="/homework" element={<StudentHomeworkPage />} />
            <Route path="/grades" element={<StudentGradebookPage />} />
            <Route path="/profile" element={<StudentProfilePage />} />
            <Route path="/subjects/:subjectId" element={<SubjectDetailRoute />} />
            <Route
              path="/subjects/:subjectId/lessons/:lessonId"
              element={<LessonQuizRoute />}
            />
          </Route>
        </Route>
      </Route>
      <Route element={<RequireRole role="admin" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/:tab" element={<AdminDashboard />} />
        </Route>
      </Route>
      <Route element={<RequireRole role="teacher" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/:tab" element={<TeacherDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<EntryRedirect />} />
    </Routes>
  );
}

function EntryRedirect() {
  const user = useAuthStore((state) => state.currentUser);
  if (!user) return <PublicLanding />;
  return <Navigate to={getHomeRoute(user.role)} replace />;
}

function LoginRoute() {
  const user = useAuthStore((state) => state.currentUser);
  if (user) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }
  return <Login />;
}

function getHomeRoute(role: Role) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/student";
}

function RequireRole({ role }: { role: Role }) {
  const user = useAuthStore((state) => state.currentUser);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }
  return <Outlet />;
}

function StudentLayout() {
  const location = useLocation();
  const authenticatedUser = useAuthStore((state) => state.currentUser);
  const user = useStore((state) => state.user);
  const activateUser = useStore((state) => state.activateUser);

  useEffect(() => {
    if (authenticatedUser?.role === "student") {
      const grade = Number.parseInt(authenticatedUser.kelas ?? "", 10) || 1;
      if (
        !user ||
        user.nim !== authenticatedUser.username ||
        user.name !== authenticatedUser.name ||
        user.grade !== grade ||
        user.role !== "student"
      ) {
        activateUser({
          nim: authenticatedUser.username,
          name: authenticatedUser.name,
          grade,
          role: "student",
        });
      }
    }
  }, [authenticatedUser, user, activateUser]);

  if (!authenticatedUser || authenticatedUser.role !== "student") {
    return <Navigate to="/login" replace />;
  }
  if (!user || user.nim !== authenticatedUser.username || user.role !== "student") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 font-bold text-slate-600">
        Menyiapkan akun siswa...
      </div>
    );
  }

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Outlet />
    </motion.div>
  );
}

function SubjectDetailRoute() {
  const { subjectId } = useParams();
  const subjects = useStore((state) => state.subjects);
  const navigate = useNavigate();
  const subject = subjects.find((item) => item.id === subjectId);

  if (!subject) return <Navigate to="/student" replace />;

  return (
    <div>
      <SubjectDetail
        subject={subject}
        onBack={() => navigate("/student")}
        onLessonSelect={(lessonId) => navigate(`/subjects/${subject.id}/lessons/${lessonId}`)}
      />
    </div>
  );
}

function LessonQuizRoute() {
  const { subjectId, lessonId } = useParams();
  const subjects = useStore((state) => state.subjects);
  const markLessonComplete = useStore((state) => state.markLessonComplete);
  const navigate = useNavigate();
  const subject = subjects.find((item) => item.id === subjectId);
  const lesson = subject?.lesson.find((item) => item.id === lessonId);

  if (!subject || !lesson) return <Navigate to="/student" replace />;

  return (
    <div>
      <Quiz
        lessonId={lesson.id}
        onComplete={() => {
          markLessonComplete(lesson.id);
          navigate(`/subjects/${subject.id}`);
        }}
        onCancel={() => navigate(`/subjects/${subject.id}`)}
      />
    </div>
  );
}

function StudentDashboard() {
  const user = useStore((state) => state.user);
  const subjects = useStore((state) => state.subjects);
  const schedules = useStore((state) => state.schedules);
  const announcements = useStore((state) => state.announcements);
  const users = useAuthStore((state) => state.users);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isSchedule = location.pathname === "/schedule";
  const isMaterials = location.pathname === "/student/materials";

  if (!user || user.role !== "student") return <Navigate to="/login" replace />;

  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.grade === user.grade &&
      sub.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const subjectImages: Record<string, string> = {
    matematika: "photo-1509228468518-180dd4864904",
    bahasa: "photo-1455390582262-044cdead277a",
    ipa: "photo-1532094349884-543bc11b234d",
    teknologi: "photo-1516321318423-f06f85e504b3",
  };
  const carouselItems = filteredSubjects.map((subject) => {
    const image =
      subjectImages[subject.category.toLowerCase()] ??
      "photo-1509062522246-3755977927d7";

    return {
      src: `https://images.unsplash.com/${image}?w=900&q=80&auto=format&fit=crop`,
      alt: `${subject.title} — ${subject.description}`,
      title: subject.title,
      subtitle: `Kelas ${subject.grade} · ${subject.category}`,
    };
  });

  const scheduleData = schedules
    .filter((schedule) => schedule.grade === user.grade)
    .sort((first, second) =>
      ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].indexOf(first.day) -
        ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].indexOf(second.day) ||
      first.time.localeCompare(second.time),
    );

  return (
    <>
      {location.pathname === "/student" && announcements.length > 0 && (
        <TiltedCard as="section" className="space-y-3 rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 shadow-[0_5px_0_0_#fde68a]" aria-label="Pengumuman sekolah">
          <h2 className="text-lg font-black text-amber-900">📣 Pengumuman Sekolah</h2>
          {announcements.map((announcement) => (
            <TiltedCard as="article" key={announcement.id} className="rounded-2xl border border-amber-200 bg-white/80 p-4">
              <h3 className="font-black text-slate-800">{announcement.title}</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{announcement.message}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">
                {announcement.authorName} · {new Date(announcement.createdAt).toLocaleDateString("id-ID")}
              </p>
            </TiltedCard>
          ))}
        </TiltedCard>
      )}
      {isSchedule ? (
        <TiltedCard className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#e2e8f0] space-y-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <span>📅</span> Jadwal Pelajaran Mingguan - Kelas {user.grade} SD
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduleData.length === 0 && (
              <p className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500 md:col-span-2">
                Jadwal kelasmu belum diterbitkan oleh guru.
              </p>
            )}
            {scheduleData.map((item) => (
              <TiltedCard
                as="article"
                key={item.id}
                className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex justify-between items-center hover:border-indigo-400 transition"
              >
                <div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-xl font-black text-xs uppercase">
                    {item.day}
                  </span>
                  <h3 className="font-black text-slate-800 text-lg mt-1">{item.subject}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">📍 {item.room} · Guru {users.find((teacher) => teacher.id === item.teacherId)?.name ?? "sekolah"}</p>
                </div>
                <div className="px-4 py-2 bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300">
                  ⏰ {item.time}
                </div>
              </TiltedCard>
            ))}
          </div>
        </TiltedCard>
      ) : (
        <>
          {!isMaterials && (
            <TiltedCard as="section" className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                MENTARI · Kelas {user.grade}
              </p>
              <h1 className="mt-2 text-2xl font-black text-slate-800">
                Selamat datang, {user.name}!
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                Siap belajar hari ini? Buka materi, lihat jadwal, atau periksa hasil belajarmu.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/student/materials")}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Jelajahi materi
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/schedule")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Lihat jadwal
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/grades")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Nilai & rapor
                </button>
              </div>
            </TiltedCard>
          )}
          {isMaterials && (
            <>
          <TiltedCard className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0] flex gap-4">
            <input
              type="text"
              placeholder="🔍 Cari pelajaran kelas kamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-indigo-500 focus:outline-none bg-slate-50"
            />
          </TiltedCard>

          {filteredSubjects.length === 0 ? (
            <TiltedCard className="bg-white p-12 rounded-3xl border-2 border-slate-200 text-center space-y-3">
              <div className="text-5xl">🎒</div>
              <h3 className="text-xl font-black text-slate-800">Belum ada materi terbit</h3>
              <p className="text-slate-500 text-sm font-medium">
                Minta Admin untuk menambahkan materi untuk Kelas {user.grade} SD.
              </p>
            </TiltedCard>
          ) : (
            <>
              <TiltedCard
                as="section"
                id="materials"
                className={`${isMaterials ? "" : "hidden"} overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-[0_4px_0_0_#e2e8f0] md:p-6`}
                aria-label="Jelajahi materi pelajaran"
              >
                <h2 className="mb-2 text-lg font-black text-slate-800">
                  Jelajahi Materi Kelas {user.grade}
                </h2>
                <p className="mb-3 text-sm font-medium text-slate-500">
                  Geser untuk melihat materi, lalu pilih kartu untuk mulai belajar.
                </p>
                <CircularCarousel
                  items={carouselItems}
                  preset="cylinder"
                  intro="spin"
                  cardWidth={260}
                  aspectRatio={0.8}
                  speed={18}
                  autoplay={carouselItems.length > 1 ? "drift" : "off"}
                  pauseOnHover={false}
                  focusOnClick
                  parallax={0.5}
                  stretch={0.75}
                  depthFade={0.35}
                  fadeColor="#ffffff"
                  captions
                  style={{ height: "460px" }}
                  onItemClick={(_, index) => {
                    const subject = filteredSubjects[index];
                    if (subject) navigate(`/subjects/${subject.id}`);
                  }}
                />
              </TiltedCard>

              <div id="quizzes" className={`${isMaterials ? "" : "hidden"} scroll-mt-24 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`}>
                {filteredSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onSelect={(selected) => navigate(`/subjects/${selected.id}`)}
                  />
                ))}
              </div>
            </>
          )}
            </>
          )}
        </>
      )}
    </>
  );
}

export default App;