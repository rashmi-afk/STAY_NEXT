import API from "./api";

export const addProperty = async (propertyData) => {
  const response = await API.post("/properties", propertyData);
  return response.data;
};

export const getAllProperties = async (filters = {}, page = 1, limit = 9) => {
  const query = new URLSearchParams();

  if (filters.location) query.append("location", filters.location);
  if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
  if (filters.guests) query.append("guests", filters.guests);
  query.append("page", page);
  query.append("limit", limit);

  const response = await API.get(`/properties?${query.toString()}`);
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await API.get(`/properties/${id}`);
  return response.data;
};

export const getMyProperties = async (page = 1, limit = 9) => {
  const response = await API.get(`/properties/my-properties?page=${page}&limit=${limit}`);
  return response.data;
};

export const updateProperty = async (propertyId, propertyData) => {
  const response = await API.put(`/properties/${propertyId}`, propertyData);
  return response.data;
};

export const deleteProperty = async (propertyId) => {
  const response = await API.delete(`/properties/${propertyId}`);
  return response.data;
};
