import API from "./api";

export const createPayment = async (paymentData) => {
  const response = await API.post("/payments", paymentData);
  return response.data;
};

export const completePayment = async (paymentId) => {
  const response = await API.put(`/payments/${paymentId}/success`);
  return response.data;
};

export const failPayment = async (paymentId) => {
  const response = await API.put(`/payments/${paymentId}/fail`);
  return response.data;
};

export const getMyPayments = async () => {
  const response = await API.get("/payments/my-payments");
  return response.data;
};
