
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";

const navItems = [
  { path: "/admin", label: "📊 Dashboard", end: true },
  { path: "/admin/movies", label: "🎬 Phim" },
  { path: "/admin/showtimes", label: "🕐 Suất chiếu" },
  { path: "/admin/users", label: "👥 Người dùng" },
  { path: "/admin/bookings", label: "🎟 Đặt vé" },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fa" }}>
      {/* Sidebar */}
      <div style={{
        width: 240, background: "#1a1a2e", color: "#fff",
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #333" }}>
          <h2 style={{ margin: 0, fontSize: 18, color: "#e50914" }}>🎬 Movie Admin</h2>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#888" }}>
            👤 {user?.name ?? user?.email}
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: "block",
                padding: "12px 20px",
                color: isActive ? "#fff" : "#aaa",
                background: isActive ? "#e50914" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
                transition: "all 0.2s",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: 16, borderTop: "1px solid #333" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "10px 0", background: "transparent",
              color: "#aaa", border: "1px solid #444", borderRadius: 6,
              cursor: "pointer", fontSize: 13,
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}