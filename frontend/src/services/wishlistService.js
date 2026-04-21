import API from "./api";

const normalizeWishlist = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.properties)) return data.properties;
  return [];
};

export const addToWishlist = async (propertyId) => {
  const response = await API.post(`/wishlist/${propertyId}`);
  return response.data;
};

export const removeFromWishlist = async (propertyId) => {
  const response = await API.delete(`/wishlist/${propertyId}`);
  return response.data;
};

export const getWishlist = async () => {
  const response = await API.get("/wishlist");
  return normalizeWishlist(response.data);
};
