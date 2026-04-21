import API from "./api";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await API.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};