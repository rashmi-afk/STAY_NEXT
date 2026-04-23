import API from "./api";

export const askAssistant = async (message) => {
  const response = await API.post("/assistant/ask", { message });
  return response.data;
};
