// src/pages/admin/Bookings.jsx (tạm thời, sẽ đổi tên sau)
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminApi from "../../services/modules/admin.api";

const STATUS_COLOR = {
  CONFIRMED: { bg: "#eafaf1", color: "#2ecc71" },
  PENDING: { bg: "#fef9e7", color: "#f39c12" },
  CANCELLED: { bg: "#fdecea", color: "#e74c3c" },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.getBookings({ page, limit: 10, status: status || undefined })
      .then((data) => {
        setBookings(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <AdminLayout>
      <div style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>🎟 Quản lý đặt vé</h1>
          <span style={{ color: "#888", fontSize: 14 }}>Tổng: {total} đơn</span>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: 20 }}>
          {["", "CONFIRMED", "PENDING", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              style={{
                marginRight: 8, padding: "6px 16px", borderRadius: 20,
                border: "1px solid #ddd", cursor: "pointer", fontSize: 13,
                background: status === s ? "#e50914" : "#fff",
                color: status === s ? "#fff" : "#333",
              }}
            >
              {s || "Tất cả"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                {["Mã", "Khách hàng", "Phim", "Rạp", "Ghế", "Tổng tiền", "Trạng thái", "Thời gian"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600, borderBottom: "1px solid #eee" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>Đang tải...</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px", color: "#888", fontSize: 12 }}>#{b.id.slice(-6)}</td>
                  <td style={{ padding: "12px 16px" }}>{b.user.name ?? b.user.email}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{b.movie}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{b.theater}</td>
                  <td style={{ padding: "12px 16px" }}>{b.seats.join(", ")}</td>
                  <td style={{ padding: "12px 16px", color: "#e50914", fontWeight: 600 }}>
                    {b.totalPrice.toLocaleString()}đ
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: STATUS_COLOR[b.status]?.bg,
                      color: STATUS_COLOR[b.status]?.color,
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#888", fontSize: 12 }}>
                    {new Date(b.createdAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={btnStyle}>← Trước</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={{ ...btnStyle, background: page === i + 1 ? "#e50914" : "#fff", color: page === i + 1 ? "#fff" : "#000" }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={btnStyle}>Tiếp →</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const btnStyle = { padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer", background: "#fff" };