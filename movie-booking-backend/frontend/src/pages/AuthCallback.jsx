// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Lấy params từ URL: /auth/callback?token=...&userId=...&name=...&role=...
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const name = params.get("name");
    const role = params.get("role");

    if (token && userId) {
      setAuth({ id: userId, name: decodeURIComponent(name || ""), role }, token);
      navigate("/");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 100, color: "#fff", background: "#0f0f1a", minHeight: "100vh" }}>
      <p>Đang xử lý đăng nhập...</p>
    </div>
  );
}