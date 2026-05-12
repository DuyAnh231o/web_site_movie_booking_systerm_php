
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminApi from "../../services/modules/admin.api";

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flex: 1,
    borderLeft: `4px solid ${color}`,
  }}>
    <p style={{ margin: "0 0 8px", color: "#888", fontSize: 13 }}>{icon} {label}</p>
    <h2 style={{ margin: 0, fontSize: 28, color }}>{value}</h2>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><p style={{ padding: 40 }}>Đang tải...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ padding: 32 }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 24 }}>📊 Dashboard</h1>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <StatCard label="Tổng phim" value={stats?.totalMovies ?? 0} color="#3498db" icon="🎬" />
          <StatCard label="Người dùng" value={stats?.totalUsers ?? 0} color="#2ecc71" icon="👥" />
          <StatCard label="Đơn đặt vé" value={stats?.totalBookings ?? 0} color="#e67e22" icon="🎟" />
          <StatCard
            label="Doanh thu"
            value={`${(stats?.totalRevenue ?? 0).toLocaleString()}đ`}
            color="#e50914"
            icon="💰"
          />
        </div>

        {/* Recent Bookings */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 16px" }}>🕐 Đặt vé gần đây</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                {["Mã", "Khách hàng", "Phim", "Ghế", "Tổng tiền", "Thời gian"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#888", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recentBookings?.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "10px 12px", color: "#888", fontSize: 12 }}>#{b.id.slice(-6)}</td>
                  <td style={{ padding: "10px 12px" }}>{b.user.name ?? b.user.email}</td>
                  <td style={{ padding: "10px 12px" }}>{b.movie}</td>
                  <td style={{ padding: "10px 12px" }}>{b.seats.join(", ")}</td>
                  <td style={{ padding: "10px 12px", color: "#e50914", fontWeight: 600 }}>
                    {b.totalPrice.toLocaleString()}đ
                  </td>
                  <td style={{ padding: "10px 12px", color: "#888", fontSize: 12 }}>
                    {new Date(b.createdAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}