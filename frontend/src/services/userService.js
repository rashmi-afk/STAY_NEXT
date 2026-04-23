import API from "./api";

export const getAllUsers = async ({ page = 1, limit = 10, search = "", hostStatus = "" } = {}) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) query.append("search", search);
  if (hostStatus) query.append("hostStatus", hostStatus);

  const response = await API.get(`/users?${query.toString()}`);
  return response.data;
};

export const updateHostApproval = async (userId, hostApprovalStatus) => {
  const response = await API.put(`/users/${userId}/host-approval`, {
    hostApprovalStatus,
  });
  return response.data;
};

export const getMyProfile = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await API.put("/users/me", payload);
  return response.data;
};
