// src/pages/admin/Users.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminApi from "../../services/modules/admin.api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 10, search })
      .then((data) => {
        setUsers(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleRoleChange = async (id, role) => {
    if (!confirm(`Đổi role thành ${role}?`)) return;
    await adminApi.updateUserRole(id, role);
    fetchUsers();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa user "${name}"?`)) return;
    await adminApi.deleteUser(id);
    fetchUsers();
  };

  return (
    <AdminLayout>
      <div style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>👥 Quản lý người dùng</h1>
          <span style={{ color: "#888", fontSize: 14 }}>Tổng: {total} người dùng</span>
        </div>

        {/* Search */}
        <input
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #ddd", width: 280, marginBottom: 20, fontSize: 14 }}
        />

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                {["ID", "Tên", "Email", "Role", "Đặt vé", "Ngày tạo", "Thao tác"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600, borderBottom: "1px solid #eee" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#888" }}>Đang tải...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px", color: "#888", fontSize: 12 }}>#{u.id.slice(-6)}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{u.name ?? "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: u.role === "ADMIN" ? "#ffeaea" : "#eaf4ff",
                      color: u.role === "ADMIN" ? "#e50914" : "#3498db",
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>{u.bookingCount}</td>
                  <td style={{ padding: "12px 16px", color: "#888", fontSize: 12 }}>
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleRoleChange(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #3498db", background: "#fff", color: "#3498db", cursor: "pointer", fontSize: 12 }}
                      >
                        {u.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name ?? u.email)}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e50914", background: "#fff", color: "#e50914", cursor: "pointer", fontSize: 12 }}
                      >
                        Xóa
                      </button>
                    </div>
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