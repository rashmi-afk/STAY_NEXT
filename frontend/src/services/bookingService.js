import API from "./api";

export const createBooking = async (bookingData) => {
  const response = await API.post("/bookings", bookingData);
  return response.data;
};

export const getMyBookings = async (page = 1, limit = 10) => {
  const response = await API.get(`/bookings/my-bookings?page=${page}&limit=${limit}`);
  return response.data;
};

export const getHostBookings = async (page = 1, limit = 10) => {
  const response = await API.get(`/bookings/host-bookings?page=${page}&limit=${limit}`);
  return response.data;
};

export const getAllBookings = async (page = 1, limit = 10) => {
  const response = await API.get(`/bookings/admin/all?page=${page}&limit=${limit}`);
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

export const punchInBooking = async (bookingId) => {
  const response = await API.put(`/bookings/${bookingId}/punch-in`);
  return response.data;
};

export const punchOutBooking = async (bookingId) => {
  const response = await API.put(`/bookings/${bookingId}/punch-out`);
  return response.data;
};
