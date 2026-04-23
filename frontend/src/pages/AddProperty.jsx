import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProperty } from "../services/propertyService";
import { uploadImages } from "../services/uploadService";
import "../styles/AddProperty.css";

const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

function AddProperty() {
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const isHostPendingApproval =
    userInfo?.role === "host" && userInfo?.hostApprovalStatus !== "approved";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    pricePerNight: "",
    imageUrls: [],
    amenities: "",
    maxGuests: "",
  });

  const [previewUrls, setPreviewUrls] = useState([]);
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
    if (isHostPendingApproval) {
      setError("Your host account is awaiting admin approval.");
      return;
    }

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.some((file) => !file.type.startsWith("image/"))) {
      setError("Please select valid image files");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const localPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(localPreviews);

      const data = await uploadImages(files);
      const uploadedUrls = data.urls || (data.url ? [data.url] : []);

      if (uploadedUrls.length === 0) {
        throw new Error("Image URLs not returned from server");
      }

      setFormData((prev) => ({
        ...prev,
        imageUrls: uploadedUrls,
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Image upload failed");
      setPreviewUrls([]);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [],
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isHostPendingApproval) {
      setError("Your host account is awaiting admin approval.");
      return;
    }

    if (formData.imageUrls.length === 0) {
      setError("Please upload at least one image before adding the property");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        pricePerNight: Number(formData.pricePerNight),
        images: formData.imageUrls,
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
        imageUrls: [],
        amenities: "",
        maxGuests: "",
      });
      setPreviewUrls([]);

      setTimeout(() => {
        navigate("/my-properties");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  const imagesForPreview = previewUrls.length > 0 ? previewUrls : formData.imageUrls;

  if (isHostPendingApproval) {
    return (
      <div className="add-property-page">
        <div className="add-property-wrapper">
          <div className="add-property-header">
            <h1>Host Approval Pending</h1>
            <p>Your host account must be approved by an admin before you can add properties.</p>
          </div>
        </div>
      </div>
    );
  }

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
            <label htmlFor="propertyImage">Upload Images</label>
            <input
              type="file"
              id="propertyImage"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            {uploading && <small>Uploading images...</small>}
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
              {imagesForPreview.length > 0 ? (
                <div className="preview-grid">
                  {imagesForPreview.map((url) => (
                    <img key={url} src={url} alt="Preview" />
                  ))}
                </div>
              ) : (
                <span>No image preview available</span>
              )}
            </div>
          </div>

          <div className="form-actions full-width">
            <button type="submit" disabled={loading || uploading}>
              {uploading
                ? "Uploading Images..."
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
