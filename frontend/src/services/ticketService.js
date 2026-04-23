import API from "./api";

export const createTicket = async (data) => {
  const response = await API.post("/tickets", data);
  return response.data;
};

export const getMyTickets = async (page = 1, limit = 10) => {
  const response = await API.get(`/tickets/my-tickets?page=${page}&limit=${limit}`);
  return response.data;
};

export const getAllTickets = async (page = 1, limit = 10) => {
  const response = await API.get(`/tickets/all?page=${page}&limit=${limit}`);
  return response.data;
};

export const updateTicket = async (ticketId, data) => {
  const response = await API.put(`/tickets/${ticketId}`, data);
  return response.data;
};
