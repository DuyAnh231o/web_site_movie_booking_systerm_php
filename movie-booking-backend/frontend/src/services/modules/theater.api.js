// src/services/modules/theater.api.js
import axiosClient from "../axiosClient";

const theaterApi = {
  getAll: () => axiosClient.get("/theaters"),
  getRooms: (theaterId) => axiosClient.get(`/rooms/theater/${theaterId}`),
};

export default theaterApi;