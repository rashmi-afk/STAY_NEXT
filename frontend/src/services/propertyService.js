import API from "./api";

export const addProperty = async (propertyData) => {
  const response = await API.post("/properties", propertyData);
  return response.data;
};

export const getAllProperties = async (filters = {}) => {
  const query = new URLSearchParams();

  if (filters.location) query.append("location", filters.location);
  if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
  if (filters.guests) query.append("guests", filters.guests);

  const response = await API.get(`/properties?${query.toString()}`);
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await API.get(`/properties/${id}`);
  return response.data;
};

export const getMyProperties = async () => {
  const response = await API.get("/properties/my-properties");
  return response.data;
};