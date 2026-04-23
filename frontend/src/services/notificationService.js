import API from "./api";

export const getMyNotifications = async (page = 1, limit = 10) => {
  const response = await API.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await API.put(`/notifications/${notificationId}/read`);
  return response.data;
};
