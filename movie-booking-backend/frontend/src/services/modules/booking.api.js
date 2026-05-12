 
import axiosClient from "../axiosClient";

export const bookingApi = {
  getSeats: (showtimeId) =>
    axiosClient.get(`/showtimes/${showtimeId}/seats`),
};