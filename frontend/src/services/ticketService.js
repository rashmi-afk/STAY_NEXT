import API from "./api";

export const createTicket = async (data) => {
  const response = await API.post("/tickets", data);
  return response.data;
};

export const getMyTickets = async () => {
  const response = await API.get("/tickets/my-tickets");
  return response.data;
};