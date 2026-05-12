
import axiosClient from "../axiosClient";

const authApi = {
  register: (data) => axiosClient.post("/auth/register", data),
  login: (data) => axiosClient.post("/auth/login", data),
  getMe: () => axiosClient.get("/auth/me"),
  loginWithGoogle: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },
};

export default authApi;