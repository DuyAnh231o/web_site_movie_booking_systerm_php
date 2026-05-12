// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../services/modules/auth.api";
import useAuthStore from "../store/auth.store";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data =
        tab === "login"
          ? await authApi.login({ email: form.email, password: form.password })
          : await authApi.register({ name: form.name, email: form.email, password: form.password });

      setAuth(data.user, data.token);
      // nếu là ADMIN vào trang '/admin' và user vào '/'
    if (data.user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  } catch (err) {
    setError(err.response?.data?.message || "Có lỗi xảy ra");
  } finally {
    setLoading(false);
  }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f1a",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: 16,
          padding: "40px 36px",
          width: 380,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <h1 style={{ textAlign: "center", color: "#fff", margin: "0 0 24px", fontSize: 24 }}>
          🎬 Movie Booking
        </h1>

        {/* Tab */}
        <div style={{ display: "flex", marginBottom: 24, borderRadius: 8, overflow: "hidden", border: "1px solid #333" }}>
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                cursor: "pointer",
                background: tab === t ? "#e50914" : "transparent",
                color: tab === t ? "#fff" : "#888",
                fontWeight: tab === t ? 600 : 400,
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              {t === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {tab === "register" && (
            <div style={{ marginBottom: 16 }}>
              <input
                name="name"
                placeholder="Họ tên"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <input
              name="email"
              type="text"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: "#e50914", fontSize: 13, margin: "0 0 12px", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 0",
              background: loading ? "#888" : "#e50914",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Đang xử lý..." : tab === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#333" }} />
          <span style={{ color: "#666", fontSize: 13, padding: "0 12px" }}>hoặc</span>
          <div style={{ flex: 1, height: 1, background: "#333" }} />
        </div>

        {/* Google Login */}
        <button
          onClick={() => authApi.loginWithGoogle()}
          style={{
            width: "100%",
            padding: "11px 0",
            background: "#fff",
            color: "#333",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            style={{ width: 18, height: 18 }}
          />
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#0f0f1a",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};