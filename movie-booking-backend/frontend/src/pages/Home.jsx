 

import useAuthStore from "../store/auth.store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import movieApi from "../services/modules/movie.api";

export default function Home() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    setLoading(true);
    movieApi
      .getAll({ page, limit: 8, search })
      .then((data) => {
        setMovies(data.data);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
      {user ? (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <span>👤 {user.name}</span>
    <button onClick={() => { logout(); navigate("/login"); }}>Đăng xuất</button>
  </div>
) : (
  <button onClick={() => navigate("/login")}>Đăng nhập</button>
)}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>🎬 Movie Booking</h1>
        <input
          type="text"
          placeholder="Tìm kiếm phim..."
          value={search}
          onChange={handleSearch}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            width: 250,
            fontSize: 14,
          }}
        />
      </div>

      {/* Movie Grid */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Đang tải...</p>
      ) : movies.length === 0 ? (
        <p style={{ textAlign: "center" }}>Không tìm thấy phim nào</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => navigate(`/movies/${movie.id}`)}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer",
                transition: "transform 0.2s",
                background: "#fff",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {/* Poster */}
              <div style={{ height: 300, background: "#1a1a2e", overflow: "hidden" }}>
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 48,
                    }}
                  >
                    🎥
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "12px" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>
                  {movie.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                  ⏱ {movie.duration} phút
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
                  📅 {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                </p>
                <button
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: "8px 0",
                    background: "#e50914",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Đặt vé
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #ccc",
              cursor: page === 1 ? "not-allowed" : "pointer",
              background: page === 1 ? "#f5f5f5" : "#fff",
            }}
          >
            ← Trước
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "1px solid #ccc",
                cursor: "pointer",
                background: page === i + 1 ? "#e50914" : "#fff",
                color: page === i + 1 ? "#fff" : "#000",
                fontWeight: page === i + 1 ? 600 : 400,
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #ccc",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              background: page === totalPages ? "#f5f5f5" : "#fff",
            }}
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
}