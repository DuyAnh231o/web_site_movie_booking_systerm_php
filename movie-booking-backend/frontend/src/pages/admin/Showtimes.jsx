// src/pages/admin/Showtimes.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import showtimeApi from "../../services/modules/showtime.api";
import movieApi from "../../services/modules/movie.api";
import theaterApi from "../../services/modules/theater.api";

const emptyForm = { movieId: "", roomId: "", startTime: "", price: "" };

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editShowtime, setEditShowtime] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterMovieId, setFilterMovieId] = useState("");

  const fetchShowtimes = () => {
    setLoading(true);
    showtimeApi.getAll(filterMovieId ? { movieId: filterMovieId } : {})
      .then(setShowtimes)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchShowtimes(); }, [filterMovieId]);

  useEffect(() => {
    // Load movies và theaters cho form
    movieApi.getAll({ limit: 100 }).then((data) => setMovies(data.data));
    theaterApi.getAll().then(setTheaters);
  }, []);

  // Load rooms khi chọn theater
  const handleTheaterChange = async (theaterId) => {
    if (!theaterId) { setRooms([]); return; }
    const data = await theaterApi.getRooms(theaterId);
    setRooms(data);
    setForm((f) => ({ ...f, roomId: "" }));
  };

  const openCreate = () => {
    setEditShowtime(null);
    setForm(emptyForm);
    setRooms([]);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditShowtime(s);
    setForm({
      movieId: s.movieId,
      roomId: s.roomId,
      startTime: new Date(s.startTime).toISOString().slice(0, 16),
      price: s.price,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.movieId || !form.roomId || !form.startTime || !form.price) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setSaving(true);
    try {
      if (editShowtime) {
        await showtimeApi.update(editShowtime.id, {
          startTime: form.startTime,
          price: Number(form.price),
        });
      } else {
        await showtimeApi.create({
          movieId: Number(form.movieId),
          roomId: Number(form.roomId),
          startTime: form.startTime,
          price: Number(form.price),
        });
      }
      setShowForm(false);
      fetchShowtimes();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa suất chiếu này?")) return;
    await showtimeApi.remove(id);
    fetchShowtimes();
  };

  return (
    <AdminLayout>
      <div style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>🕐 Quản lý suất chiếu</h1>
          <button
            onClick={openCreate}
            style={{ padding: "8px 20px", background: "#e50914", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
          >
            + Thêm suất chiếu
          </button>
        </div>

        {/* Filter theo phim */}
        <div style={{ marginBottom: 20 }}>
          <select
            value={filterMovieId}
            onChange={(e) => setFilterMovieId(e.target.value)}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, minWidth: 240 }}
          >
            <option value="">Tất cả phim</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                {["Phim", "Rạp", "Phòng", "Giờ chiếu", "Giá vé", "Thao tác"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600, borderBottom: "1px solid #eee" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#888" }}>Đang tải...</td></tr>
              ) : showtimes.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#888" }}>Chưa có suất chiếu nào</td></tr>
              ) : showtimes.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{s.movie?.title}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{s.room?.theater?.name}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{s.room?.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {new Date(s.startTime).toLocaleString("vi-VN", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#e50914", fontWeight: 600 }}>
                    {Number(s.price).toLocaleString()}đ
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(s)}
                        style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #3498db", background: "#fff", color: "#3498db", cursor: "pointer", fontSize: 12 }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #e50914", background: "#fff", color: "#e50914", cursor: "pointer", fontSize: 12 }}
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
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 440 }}>
            <h2 style={{ margin: "0 0 20px" }}>{editShowtime ? "Sửa suất chiếu" : "Thêm suất chiếu"}</h2>

            {/* Chọn phim */}
            {!editShowtime && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Phim *</label>
                <select
                  value={form.movieId}
                  onChange={(e) => setForm({ ...form, movieId: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">-- Chọn phim --</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Chọn rạp */}
            {!editShowtime && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Rạp *</label>
                <select
                  onChange={(e) => handleTheaterChange(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">-- Chọn rạp --</option>
                  {theaters.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Chọn phòng */}
            {!editShowtime && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Phòng *</label>
                <select
                  value={form.roomId}
                  onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  style={selectStyle}
                  disabled={rooms.length === 0}
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Giờ chiếu */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Giờ chiếu *</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Giá vé */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Giá vé (đ) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="VD: 100000"
                style={inputStyle}
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

const labelStyle = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#555" };
const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" };
const selectStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", background: "#fff" };