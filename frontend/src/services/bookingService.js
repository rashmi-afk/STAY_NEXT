import API from "./api";

export const createBooking = async (bookingData) => {
  const response = await API.post("/bookings", bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await API.get("/bookings/my-bookings");
  return response.data;
};

export const getBookingById = async (bookingId) => {
  const response = await API.get(`/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await API.put(`/bookings/${bookingId}/cancel`);
  return response.data;
};