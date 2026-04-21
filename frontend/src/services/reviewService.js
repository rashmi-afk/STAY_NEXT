import API from "./api";

export const createReview = async (reviewData) => {
  const response = await API.post("/reviews", reviewData);
  return response.data;
};

export const getPropertyReviews = async (propertyId) => {
  const response = await API.get(`/reviews/property/${propertyId}`);
  return response.data;
};