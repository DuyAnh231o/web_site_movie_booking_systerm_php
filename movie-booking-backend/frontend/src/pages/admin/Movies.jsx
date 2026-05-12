// src/pages/admin/Movies.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import movieApi from "../../services/modules/movie.api";

const emptyForm = { title: "", description: "", duration: "", releaseDate: "", posterUrl: "" };

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchMovies = () => {
    setLoading(true);
    movieApi.getAll({ page, limit: 10, search })
      .then((data) => {
        setMovies(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMovies(); }, [page, search]);

  const openCreate = () => {
    setEditMovie(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (movie) => {
    setEditMovie(movie);
    setForm({
      title: movie.title,
      description: movie.description ?? "",
      duration: movie.duration,
      releaseDate: new Date(movie.releaseDate).toISOString().split("T")[0],
      posterUrl: movie.posterUrl ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editMovie) {
        await movieApi.update(editMovie.id, form);
      } else {
        await movieApi.create(form);
      }
      setShowForm(false);
      fetchMovies();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Xóa phim "${title}"?`)) return;
    await movieApi.remove(id);
    fetchMovies();
  };

  return (
    <AdminLayout>
      <div style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>🎬 Quản lý phim</h1>
          <button onClick={openCreate} style={{ padding: "8px 20px", background: "#e50914", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            + Thêm phim
          </button>
        </div>

        <input
          placeholder="Tìm kiếm phim..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #ddd", width: 280, marginBottom: 20, fontSize: 14 }}
        />

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                {["Poster", "Tên phim", "Thời lượng", "Ngày chiếu", "Thao tác"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600, borderBottom: "1px solid #eee" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#888" }}>Đang tải...</td></tr>
              ) : movies.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "10px 16px" }}>
                    {m.posterUrl
                      ? <img src={m.posterUrl} alt={m.title} style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 4 }} />
                      : <div style={{ width: 40, height: 56, background: "#1a1a2e", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎥</div>
                    }
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: 500 }}>{m.title}</td>
                  <td style={{ padding: "10px 16px", color: "#555" }}>{m.duration} phút</td>
                  <td style={{ padding: "10px 16px", color: "#555" }}>
                    {new Date(m.releaseDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(m)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #3498db", background: "#fff", color: "#3498db", cursor: "pointer", fontSize: 12 }}>
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(m.id, m.title)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #e50914", background: "#fff", color: "#e50914", cursor: "pointer", fontSize: 12 }}>
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

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px" }}>{editMovie ? "Sửa phim" : "Thêm phim mới"}</h2>

            {[
              { label: "Tên phim *", key: "title", type: "text" },
              { label: "Thời lượng (phút) *", key: "duration", type: "number" },
              { label: "Ngày khởi chiếu *", key: "releaseDate", type: "date" },
              { label: "Poster URL", key: "posterUrl", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#555" }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#555" }}>Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#e50914", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const btnStyle = { padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer", background: "#fff" };