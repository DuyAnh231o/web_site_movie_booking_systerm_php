// src/pages/MovieDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import movieApi from "../services/modules/movie.api";
import showtimeApi from "../services/modules/showtime.api";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieData, showtimeData] = await Promise.all([
          movieApi.getOne(id),
          showtimeApi.getByMovie(id),
        ]);

        console.log("movieData:", movieData);
        console.log("showtimeData:", showtimeData);

        // Nếu axios trả res.data thì giữ nguyên
        // Nếu trả { data: ... } thì đổi thành movieData.data
        setMovie(movieData);

        // đảm bảo luôn là array
const times = Array.isArray(showtimeData) ? showtimeData : [];
setShowtimes(times);

        // lấy ngày đầu tiên
        if (times.length > 0) {
          const firstDate = new Date(times[0].start_time)
            .toISOString()
            .split("T")[0];

          setSelectedDate(firstDate);
        }
      } catch (error) {
        console.error("Lỗi load movie detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Đang tải...
      </p>
    );
  }

  if (!movie) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Không tìm thấy phim
      </p>
    );
  }

  // danh sách ngày chiếu
  const dates = [
    ...new Set(
      showtimes.map((s) =>
        new Date(s.start_time)
          .toISOString()
          .split("T")[0]
      )
    ),
  ].sort();

  // lọc theo ngày
  const filteredShowtimes = showtimes.filter(
    (s) =>
      new Date(s.start_time)
        .toISOString()
        .split("T")[0] === selectedDate
  );

  // group theo rạp
  const groupByTheater = filteredShowtimes.reduce((acc, s) => {
    const theaterName =
      s.room?.theater?.name ?? "Không rõ";

    if (!acc[theaterName]) {
      acc[theaterName] = [];
    }

    acc[theaterName].push(s);

    return acc;
  }, {});

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: 20,
          padding: "8px 16px",
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: 14,
          color: "#666",
        }}
      >
        ← Quay lại
      </button>

      {/* Movie info */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 32,
        }}
      >
        {/* Poster */}
        <div
          style={{
            width: 200,
            minWidth: 200,
            height: 300,
            borderRadius: 12,
            overflow: "hidden",
            background: "#1a1a2e",
            flexShrink: 0,
          }}
        >
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
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

        {/* Detail */}
        <div>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: 28,
            }}
          >
            {movie.title}
          </h1>

          <p
            style={{
              margin: "0 0 8px",
              color: "#555",
            }}
          >
            ⏱ Thời lượng:{" "}
            <strong>{movie.duration} phút</strong>
          </p>

          <p
            style={{
              margin: "0 0 8px",
              color: "#555",
            }}
          >
            📅 Khởi chiếu:{" "}
            <strong>
              {movie.release_date
                ? new Date(
                    movie.release_date
                  ).toLocaleDateString("vi-VN")
                : "Chưa cập nhật"}
            </strong>
          </p>

          {movie.description && (
            <p
              style={{
                margin: "12px 0 0",
                color: "#444",
                lineHeight: 1.6,
              }}
            >
              {movie.description}
            </p>
          )}
        </div>
      </div>

      {/* Showtimes */}
      <h2 style={{ marginBottom: 16 }}>
        🎟 Chọn suất chiếu
      </h2>

      {showtimes.length === 0 ? (
        <p style={{ color: "#888" }}>
          Chưa có suất chiếu nào
        </p>
      ) : (
        <>
          {/* Date picker */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {dates.map((date) => (
              <button
                key={date}
                onClick={() =>
                  setSelectedDate(date)
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  background:
                    selectedDate === date
                      ? "#e50914"
                      : "#fff",
                  color:
                    selectedDate === date
                      ? "#fff"
                      : "#000",
                  fontWeight:
                    selectedDate === date
                      ? 600
                      : 400,
                }}
              >
                {new Date(date).toLocaleDateString(
                  "vi-VN",
                  {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  }
                )}
              </button>
            ))}
          </div>

          {/* Group by theater */}
          {Object.entries(groupByTheater).map(
            ([theaterName, times]) => (
              <div
                key={theaterName}
                style={{
                  marginBottom: 24,
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #eee",
                  background: "#fafafa",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 4px",
                    fontSize: 16,
                  }}
                >
                  🏢 {theaterName}
                </h3>

                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 13,
                    color: "#888",
                  }}
                >
                  📍{" "}
                  {times[0]?.room?.theater
                    ?.location ?? ""}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {times.map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        navigate(
                          `/booking/${s.id}`
                        )
                      }
                      style={{
                        padding: "10px 18px",
                        borderRadius: 8,
                        border:
                          "1px solid #e50914",
                        cursor: "pointer",
                        background: "#fff",
                        color: "#e50914",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 500,
                          marginBottom: 2,
                        }}
                      >
                        {s.room?.name ??
                          `Phòng ${s.room_id}`}
                      </span>

                      {new Date(
                        s.start_time
                      ).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}

                      <span
                        style={{
                          display: "block",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        {s.price?.toLocaleString()}
                        đ
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}