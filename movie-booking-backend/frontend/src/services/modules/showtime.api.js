// src/services/modules/showtime.api.js
import axiosClient from "../axiosClient";

const showtimeApi = {
  getAll: (params) => axiosClient.get("/showtimes", { params }),
getByMovie: (movieId) => axiosClient.get("/showtimes", { params: { movie_id: movieId } }),
  getOne: (id) => axiosClient.get(`/showtimes/${id}`),
  create: (data) => axiosClient.post("/showtimes", data),
  update: (id, data) => axiosClient.put(`/showtimes/${id}`, data),
  remove: (id) => axiosClient.delete(`/showtimes/${id}`),
};

export default showtimeApi;