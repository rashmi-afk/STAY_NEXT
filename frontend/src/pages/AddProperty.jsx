import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProperty } from "../services/propertyService";
import { uploadImage } from "../services/uploadService";
import "../styles/AddProperty.css";

function AddProperty() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    pricePerNight: "",
    imageUrl: "",
    amenities: "",
    maxGuests: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      const data = await uploadImage(file);
      const uploadedUrl = data.imageUrl || data.url || "";

      if (!uploadedUrl) {
        throw new Error("Image URL not returned from server");
      }

      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadedUrl,
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Image upload failed");
      setPreviewUrl("");
      setFormData((prev) => ({
        ...prev,
        imageUrl: "",
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.imageUrl) {
      setError("Please upload an image before adding the property");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        pricePerNight: Number(formData.pricePerNight),
        images: [formData.imageUrl],
        amenities: formData.amenities
          ? formData.amenities
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        maxGuests: Number(formData.maxGuests) || 1,
      };

      await addProperty(payload);

      setSuccess("Property added successfully");

      setFormData({
        title: "",
        description: "",
        location: "",
        pricePerNight: "",
        imageUrl: "",
        amenities: "",
        maxGuests: "",
      });
      setPreviewUrl("");

      setTimeout(() => {
        navigate("/my-properties");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-page">
      <div className="add-property-wrapper">
        <div className="add-property-header">
          <h1>Add Your Property</h1>
          <p>Create a new stay listing for guests to discover and book.</p>
        </div>

        <form className="add-property-form" onSubmit={handleSubmit}>
          {error && <p className="form-message error-message">{error}</p>}
          {success && <p className="form-message success-message">{success}</p>}

          <div className="form-group full-width">
            <label htmlFor="title">Property Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Ex: Sea View Villa"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Write a short description about your property"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Ex: Goa"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pricePerNight">Price Per Night</label>
            <input
              type="number"
              id="pricePerNight"
              name="pricePerNight"
              placeholder="Ex: 3000"
              value={formData.pricePerNight}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="propertyImage">Upload Image</label>
            <input
              type="file"
              id="propertyImage"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {uploading && <small>Uploading image...</small>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="amenities">Amenities</label>
            <input
              type="text"
              id="amenities"
              name="amenities"
              placeholder="Ex: WiFi, AC, Pool, Parking"
              value={formData.amenities}
              onChange={handleChange}
            />
            <small>Separate amenities with commas</small>
          </div>

          <div className="form-group">
            <label htmlFor="maxGuests">Max Guests</label>
            <input
              type="number"
              id="maxGuests"
              name="maxGuests"
              placeholder="Ex: 4"
              value={formData.maxGuests}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group preview-box">
            <label>Image Preview</label>
            <div className="image-preview">
              {previewUrl || formData.imageUrl ? (
                <img src={previewUrl || formData.imageUrl} alt="Preview" />
              ) : (
                <span>No image preview available</span>
              )}
            </div>
          </div>

          <div className="form-actions full-width">
            <button type="submit" disabled={loading || uploading}>
              {uploading
                ? "Uploading Image..."
                : loading
                ? "Adding Property..."
                : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;