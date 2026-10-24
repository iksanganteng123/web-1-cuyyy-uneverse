import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore, type Role, type User } from "../store/useAuthStore";
import { useStore } from "../store/useStore";
import TiltedCard from "../components/TiltedCard";

const classOptions = [1, 2, 3, 4, 5, 6];
const emptyForm = {
  name: "",
  username: "",
  password: "",
  role: "student" as Role,
  kelas: "1 SD",
};

const AdminDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/")[2] ?? "overview";
  const currentUser = useAuthStore((state) => state.currentUser);
  const users = useAuthStore((state) => state.users);
  const addUser = useAuthStore((state) => state.addUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setUserPassword = useAuthStore((state) => state.setUserPassword);
  const deleteUser = useAuthStore((state) => state.deleteUser);
  const announcements = useStore((state) => state.announcements);
  const addAnnouncement = useStore((state) => state.addAnnouncement);
  const deleteAnnouncement = useStore((state) => state.deleteAnnouncement);
  const addStudent = useStore((state) => state.addStudent);
  const removeStudentByNim = useStore((state) => state.removeStudentByNim);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timeoutId = window.setTimeout(() => setMessage(""), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const handleSaveUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const previousUser = editingId
      ? users.find((user) => user.id === editingId)
      : undefined;
    const user = {
      ...form,
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password.trim() || undefined,
      kelas: form.role === "admin" ? undefined : form.kelas,
    };
    const succeeded = editingId
      ? updateUser(editingId, user)
      : Boolean(user.password) && addUser(user);

    if (!succeeded) {
      setMessage(
        user.password || editingId
          ? "Username sudah digunakan. Pilih username lain."
          : "Password wajib diisi untuk akun baru.",
      );
      return;
    }
    if (
      previousUser?.role === "student" &&
      (user.role !== "student" || previousUser.username !== user.username)
    ) {
      removeStudentByNim(previousUser.username);
    }
    if (user.role === "student") {
      addStudent({
        nim: user.username,
        name: user.name,
        grade: Number.parseInt(user.kelas ?? "", 10) || 1,
      });
    }
    setMessage(
      editingId
        ? "Perubahan akun berhasil disimpan."
        : "Akun berhasil didaftarkan.",
    );
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEditing = (user: User) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      username: user.username,
      password: "",
      role: user.role,
      kelas: user.kelas ?? "1 SD",
    });
    setMessage("");
  };

  const handleResetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordResetUser) return;

    if (!setUserPassword(passwordResetUser.id, newPassword)) {
      setMessage("Password baru wajib diisi dan akun harus masih tersedia.");
      return;
    }

    setMessage(`Password untuk ${passwordResetUser.name} berhasil direset.`);
    setPasswordResetUser(null);
    setNewPassword("");
  };

  const handleAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !currentUser ||
      !announcementTitle.trim() ||
      !announcementMessage.trim()
    )
      return;
    addAnnouncement({
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      authorId: currentUser.id,
      authorName: currentUser.name,
    });
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setMessage("Pengumuman berhasil dipublikasikan.");
  };

  return (
    <div className="font-sans text-slate-800">
      <div className="mx-auto max-w-6xl space-y-6">
        {message && (
          <div
            className="fixed right-4 top-16 z-[60] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 shadow-xl sm:right-6"
            role="status"
          >
            <p className="min-w-0 flex-1">{message}</p>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setMessage("")}
              className="rounded-lg px-1 text-sky-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-md active:scale-95"
            >
              ×
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <section className="grid gap-4 sm:grid-cols-3">
            <TiltedCard className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Total akun</p>
              <p className="mt-2 text-3xl font-black text-slate-800">{users.length}</p>
            </TiltedCard>
            <TiltedCard className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Siswa</p>
              <p className="mt-2 text-3xl font-black text-emerald-700">
                {users.filter((user) => user.role === "student").length}
              </p>
            </TiltedCard>
            <TiltedCard className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Pengumuman aktif</p>
              <p className="mt-2 text-3xl font-black text-amber-700">{announcements.length}</p>
            </TiltedCard>
            <p className="text-sm font-medium text-slate-500 sm:col-span-3">
              Halo, {currentUser?.name ?? "Admin"}. Pilih menu di sidebar untuk mengelola akun atau pengumuman.
            </p>
          </section>
        )}

        {activeTab === "users" && <div id="accounts" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <TiltedCard as="section" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-5">
            <h2 className="mb-5 text-xl font-black">
              {editingId ? "Edit Akun" : "Daftarkan Akun Baru"}
            </h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">
                Role
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value as Role })
                  }
                  className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Guru</option>
                  <option value="student">Siswa</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Nama lengkap
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Username / NIM / NIP
                <input
                  required
                  value={form.username}
                  onChange={(event) =>
                    setForm({ ...form, username: event.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Password{" "}
                {editingId && (
                  <span className="font-medium text-slate-400">
                    (kosongkan untuk tetap memakai password lama)
                  </span>
                )}
                <input
                  required={!editingId}
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              {form.role !== "admin" && (
                <label className="block text-sm font-bold text-slate-700">
                  {form.role === "teacher"
                    ? "Kelas yang diampu"
                    : "Kelas siswa"}
                  <select
                    value={form.kelas}
                    onChange={(event) =>
                      setForm({ ...form, kelas: event.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border-2 border-slate-200 p-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  >
                    {classOptions.map((level) => (
                      <option key={level} value={`${level} SD`}>
                        Kelas {level} SD
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl border-2 border-emerald-700 bg-emerald-500 p-3 font-black text-white shadow-[0_4px_0_0_#047857] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md active:scale-95 active:translate-y-1 active:shadow-none"
                >
                  {editingId ? "Simpan Perubahan" : "Daftarkan Akun"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                    className="rounded-2xl bg-slate-100 px-4 font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </TiltedCard>

          <TiltedCard as="section" className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-7">
            <h2 className="mb-4 text-xl font-black">
              Manajemen Pengguna ({users.length})
            </h2>
            <div className="w-full min-w-0 overflow-hidden">
              <table className="w-full table-fixed text-left font-sans text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs uppercase text-slate-500">
                    <th className="w-1/2 p-2 sm:w-[34%] sm:p-3">Nama / ID</th>
                    <th className="hidden p-2 sm:table-cell sm:w-[16%] sm:p-3">Role</th>
                    <th className="hidden p-2 sm:table-cell sm:w-[18%] sm:p-3">Kelas</th>
                    <th className="w-1/2 p-2 sm:w-[32%] sm:p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="break-words p-2 sm:p-3">
                        <p className="font-black">{user.name}</p>
                        <p className="break-all text-xs font-semibold text-slate-500">
                          {user.username}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                          <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold capitalize text-indigo-700">
                            {user.role}
                          </span>
                          {user.kelas && (
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                              {user.kelas}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden p-2 sm:table-cell sm:p-3">
                        <span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-black capitalize text-indigo-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="hidden break-words p-2 font-semibold sm:table-cell sm:p-3">{user.kelas ?? "—"}</td>
                      <td className="p-2 sm:p-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(user)}
                            className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordResetUser(user);
                              setNewPassword("");
                              setMessage("");
                            }}
                            className="rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                          >
                            Reset Password
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(`Hapus akun ${user.name}?`)
                                ) {
                                  deleteUser(user.id);
                                  if (user.role === "student")
                                    removeStudentByNim(user.username);
                                }
                              }}
                              className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TiltedCard>
        </div>}

        {passwordResetUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setPasswordResetUser(null);
                setNewPassword("");
              }
            }}
          >
            <section
              aria-labelledby="reset-password-title"
              aria-modal="true"
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              role="dialog"
            >
              <h2 id="reset-password-title" className="text-xl font-black text-slate-900">
                Atur password baru
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Masukkan password baru untuk{" "}
                <span className="font-bold">{passwordResetUser.name}</span>.
              </p>
              <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
                <label
                  htmlFor="user-new-password"
                  className="block text-sm font-bold text-slate-700"
                >
                  Password baru
                  <input
                    autoComplete="new-password"
                    autoFocus
                    id="user-new-password"
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Masukkan password baru"
                    required
                    type="password"
                    value={newPassword}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium outline-none transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordResetUser(null);
                      setNewPassword("");
                    }}
                    className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 hover:shadow-md active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:scale-95"
                  >
                    Simpan password
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {activeTab === "announcements" && <section id="announcements" className="grid gap-6 lg:grid-cols-2">
          <TiltedCard className="rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-[0_5px_0_0_#fde68a] sm:p-7">
          <form onSubmit={handleAnnouncement} className="space-y-3">
            <h2 className="text-xl font-black">📣 Terbitkan Pengumuman</h2>
            <input
              required
              value={announcementTitle}
              onChange={(event) => setAnnouncementTitle(event.target.value)}
              placeholder="Judul pengumuman"
              className="w-full rounded-2xl border-2 border-slate-200 p-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
            <textarea
              required
              rows={4}
              value={announcementMessage}
              onChange={(event) => setAnnouncementMessage(event.target.value)}
              placeholder="Informasi untuk seluruh siswa..."
              className="w-full rounded-2xl border-2 border-slate-200 p-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
            <button className="rounded-2xl bg-amber-500 px-5 py-3 font-black text-white shadow-[0_4px_0_0_#b45309] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-1">
              Publikasikan
            </button>
          </form>
            </TiltedCard>
            <TiltedCard as="section" className="space-y-3 rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-[0_5px_0_0_#e2e8f0] sm:p-7">
            <h2 className="text-xl font-black">
              Pengumuman Terbit ({announcements.length})
            </h2>
            {announcements.length === 0 && (
              <p className="text-sm font-medium text-slate-500">
                Belum ada pengumuman.
              </p>
            )}
            {announcements.map((item) => (
              <article
                key={item.id}
                className="flex justify-between gap-3 rounded-2xl bg-amber-50 p-4"
              >
                <div>
                  <h3 className="font-black">{item.title}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {item.message}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {item.authorName} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <button
                  onClick={() => deleteAnnouncement(item.id)}
                  className="h-fit rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                >
                  Hapus
                </button>
              </article>
            ))}
          </TiltedCard>
        </section>}
      </div>
    </div>
  );
};

export default AdminDashboard;
