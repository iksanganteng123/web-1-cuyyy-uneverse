import { useStore } from "../store/useStore";

const Header = () => {
  const user = useStore((state) => state.user);
  const xp = useStore((state) =>
    state.user?.role === "student"
      ? state.students.find((student) => student.nim === state.user?.nim)?.xp ?? 0
      : 0,
  );
  const logout = useStore((state) => state.logout);

  const getLevel = (currentXp: number) => {
    if (currentXp >= 100) return { title: "Master", color: "#FFD700" };
    if (currentXp >= 50) return { title: "Menengah", color: "#C0C0C0" };
    return { title: "Pemula", color: "#A9A9A9" };
  };

  if (!user) return null;

  const level = getLevel(xp);

  return (
    <header>
      <div>
        <h2>Belajar Kapan Saja dan selamat Datang {user.name}</h2>
        <p>
          Level: <span style={{ color: level.color }}>{level.title}</span>
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <b style={{ display: "block", fontSize: "16px" }}>
          {user.name} {user.role === "admin" && "👑"}
        </b>

        {user.role === "student" ? (
          <span style={{ fontSize: "14px", color: level.color }}>
            {level.title} | XP: {xp}
          </span>
        ) : (
          <span style={{ fontSize: "14px", color: "#e74c3c" }}>
            Administrator
          </span>
        )}
      </div>

      {/* Tombol Logout */}
      <button
        onClick={logout}
        style={{
          padding: "8px 16px",
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Logout
      </button>
    </header>
  );
};
export default Header;