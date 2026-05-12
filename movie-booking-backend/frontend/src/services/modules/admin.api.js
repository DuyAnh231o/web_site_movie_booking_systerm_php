
import axiosClient from "../axiosClient";

const adminApi = {
  getDashboard: () => axiosClient.get("/admin/dashboard"),
  getUsers: (params) => axiosClient.get("/admin/users", { params }),
  updateUserRole: (id, role) => axiosClient.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
  getBookings: (params) => axiosClient.get("/admin/bookings", { params }),
};

export default adminApi;