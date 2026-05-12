// src/components/booking/SeatMap.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEcho } from "../../hooks/useSocket";
import axiosClient from "../../services/axiosClient";
import useAuthStore from "../../store/auth.store";

export default function SeatMap({ showtimeId }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const USER_ID = Number(user?.id ?? 0);

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtime, setShowtime] = useState(null);

  useEffect(() => {
    if (!showtimeId) return;

    // 1. Load showtime + seats từ room (gộp 1 call)
    axiosClient.get(`/showtimes/${showtimeId}`)
      .then((data) => {
        setShowtime(data);
        const seatList = data.room?.seats ?? [];
        setSeats(seatList.map((s) => ({ id: s.seat_number, status: "available" })));

        // 2. Sau khi có seats, load booked seats
        axiosClient.get(`/bookings`, { params: { showtime_id: showtimeId, status: "CONFIRMED" } })
          .then((res) => {
            const bookedSeatNumbers = (res.data ?? []).flatMap((b) => b.seats ?? []);
            setSeats((prev) => prev.map((s) =>
              bookedSeatNumbers.includes(s.id) ? { ...s, status: "booked" } : s
            ));
          }).catch(() => {});

        // 3. Load ghế đang locked từ Redis
        axiosClient.get(`/seats/locked/${showtimeId}`)
          .then((lockedSeats) => {
            setSeats((prev) => prev.map((s) => {
              const found = (lockedSeats ?? []).find((l) => l.seatId === s.id);
              return found && s.status !== "booked" ? { ...s, status: "locked" } : s;
            }));
          }).catch(() => {});
      })
      .catch(() => {});

    // 4. Subscribe Reverb
    const echo = getEcho();
    const channel = echo.channel(`showtime.${showtimeId}`);

    channel.listen('.seat.locked', (data) => {
      setSeats((prev) => prev.map((s) =>
        s.id === data.seatId && s.status !== "booked" ? { ...s, status: "locked" } : s
      ));
      if (Number(data.userId) === USER_ID) {
        setSelectedSeats((prev) => prev.includes(data.seatId) ? prev : [...prev, data.seatId]);
      }
    });

    channel.listen('.seat.unlocked', (data) => {
      setSeats((prev) => prev.map((s) =>
        s.id === data.seatId && s.status !== "booked" ? { ...s, status: "available" } : s
      ));
      setSelectedSeats((prev) => prev.filter((id) => id !== data.seatId));
    });

    channel.listen('.seat.booked', (data) => {
      setSeats((prev) => prev.map((s) =>
        data.seatIds.includes(s.id) ? { ...s, status: "booked" } : s
      ));
      setSelectedSeats((prev) => prev.filter((id) => !data.seatIds.includes(id)));
    });

    return () => { echo.leave(`showtime.${showtimeId}`); };
  }, [showtimeId, USER_ID]);

  const chonGhe = async (seat) => {
    if (seat.status !== "available") return;
    try {
      await axiosClient.post("/seats/lock", {
        showtime_id: Number(showtimeId),
        seat_id: seat.id,
      });
    } catch (err) {
      alert(err.response?.data?.message || "Không thể giữ ghế");
    }
  };

  const boGhe = async (seat) => {
    try {
      await axiosClient.post("/seats/unlock", {
        showtime_id: Number(showtimeId),
        seat_id: seat.id,
      });
      setSelectedSeats((prev) => prev.filter((id) => id !== seat.id));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể bỏ ghế");
    }
  };

  const datVe = async () => {
    if (!selectedSeats.length) {
      alert("Vui lòng chọn ít nhất 1 ghế!");
      return;
    }
    try {
      const result = await axiosClient.post("/bookings/confirm", {
        showtime_id: Number(showtimeId),
        seat_ids: selectedSeats,
      });
      alert(`🎉 Đặt vé thành công!\nMã: ${result.bookingId}\nTổng: ${Number(result.totalPrice).toLocaleString()}đ`);
      setSelectedSeats([]);
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || "Đặt vé thất bại"}`);
    }
  };

  const getColor = (seat, isSelected) => {
    if (seat.status === "booked") return "#e50914";
    if (seat.status === "locked" && !isSelected) return "#f5a623";
    if (isSelected) return "#1e90ff";
    return "#2ecc71";
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", textAlign: "center", padding: 20 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ float: "left", padding: "6px 14px", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" }}
      >
        ← Quay lại
      </button>

      {showtime && (
        <div style={{ marginBottom: 16, lineHeight: 1.8 }}>
          <h2 style={{ margin: "0 0 4px" }}>🎬 {showtime.movie?.title}</h2>
          <p style={{ margin: 0, color: "#555", fontSize: 14 }}>
            🏢 {showtime.room?.theater?.name} | 🚪 {showtime.room?.name} |{" "}
            🕐 {new Date(showtime.start_time).toLocaleString("vi-VN", {
              hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit",
            })} | 💰 {Number(showtime.price).toLocaleString()}đ/ghế
          </p>
        </div>
      )}

      <div style={{ background: "#ddd", padding: 8, borderRadius: 6, marginBottom: 20, fontWeight: "bold", fontSize: 13 }}>
        SCREEN
      </div>

      {seats.length === 0 ? (
        <p style={{ color: "#888" }}>Đang tải sơ đồ ghế...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
          {seats.map((seat) => {
            const isSelected = selectedSeats.includes(seat.id);
            const isDisabled = seat.status === "booked" || (seat.status === "locked" && !isSelected);
            return (
              <button
                key={seat.id}
                disabled={isDisabled}
                onClick={() => (isSelected ? boGhe(seat) : chonGhe(seat))}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  background: getColor(seat, isSelected),
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {seat.id}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 15, fontSize: 13 }}>
        <span>🟩 Trống</span>
        <span>🟦 Đang chọn</span>
        <span>🟧 Đã giữ</span>
        <span>🟥 Đã đặt</span>
      </div>

      <p style={{ marginTop: 15 }}>
        Ghế đã chọn: <b>{selectedSeats.join(", ") || "Chưa chọn"}</b>
      </p>

      <button
        onClick={datVe}
        disabled={!selectedSeats.length}
        style={{
          padding: "10px 24px",
          background: selectedSeats.length ? "#e50914" : "#ccc",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: selectedSeats.length ? "pointer" : "not-allowed",
          fontWeight: 600,
          fontSize: 15,
          marginTop: 10,
        }}
      >
        🎟 Đặt vé ({selectedSeats.length} ghế)
        {selectedSeats.length > 0 && showtime && (
          <span style={{ display: "block", fontSize: 12, fontWeight: 400 }}>
            Tổng: {(selectedSeats.length * Number(showtime.price)).toLocaleString()}đ
          </span>
        )}
      </button>
    </div>
  );
}