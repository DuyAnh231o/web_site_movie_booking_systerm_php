
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

export default function AdminRoute({ children }) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return children;
}