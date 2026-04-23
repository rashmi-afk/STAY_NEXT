import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyProperties,
  updateProperty,
  deleteProperty,
} from "../services/propertyService";
import { uploadImages } from "../services/uploadService";
import "../styles/MyProperties.css";

const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

function MyProperties() {
  const userInfo = getUserInfo();
  const isHostPendingApproval =
    userInfo?.role === "host" && userInfo?.hostApprovalStatus !== "approved";
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingId, setEditingId] = useState("");
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    pricePerNight: "",
    amenities: "",
    maxGuests: "",
    images: [],
  });

  useEffect(() => {
    if (isHostPendingApproval) {
      setLoading(false);
      setError("");
      return;
    }

    const fetchMyProperties = async () => {
      try {
        const data = await getMyProperties();
        setProperties(data.items || []);
        setPagination(data.pagination || { page: 1, totalPages: 1 });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch your properties");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, [isHostPendingApproval]);

  const resetEditForm = () => {
    setEditingId("");
    setEditForm({
      title: "",
      description: "",
      location: "",
      pricePerNight: "",
      amenities: "",
      maxGuests: "",
      images: [],
    });
  };

  const handleEditStart = (property) => {
    setEditingId(property._id);
    setFeedback("");
    setError("");
    setEditForm({
      title: property.title || "",
      description: property.description || "",
      location: property.location || "",
      pricePerNight: property.pricePerNight || "",
      amenities: (property.amenities || []).join(", "),
      maxGuests: property.maxGuests || 1,
      images: property.images || [],
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEditImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const data = await uploadImages(files);
      const nextUrls = data.urls || [];
      setEditForm((current) => ({
        ...current,
        images: [...current.images, ...nextUrls],
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imageUrl) => {
    setEditForm((current) => ({
      ...current,
      images: current.images.filter((item) => item !== imageUrl),
    }));
  };

  const handleSaveProperty = async (propertyId) => {
    try {
      setSavingId(propertyId);
      const response = await updateProperty(propertyId, {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        pricePerNight: Number(editForm.pricePerNight),
        maxGuests: Number(editForm.maxGuests),
        amenities: editForm.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        images: editForm.images,
      });

      setProperties((current) =>
        current.map((property) =>
          property._id === propertyId ? response.property : property
        )
      );
      setFeedback("Property updated successfully");
      resetEditForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update property");
    } finally {
      setSavingId("");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    const confirmed = window.confirm("Are you sure you want to delete this property?");
    if (!confirmed) return;

    try {
      setDeletingId(propertyId);
      await deleteProperty(propertyId);
      setProperties((current) =>
        current.filter((property) => property._id !== propertyId)
      );
      setFeedback("Property deleted successfully");
      if (editingId === propertyId) {
        resetEditForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete property");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return (
      <div className="my-properties-page">
        <p className="my-properties-message">Loading your properties...</p>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="my-properties-page">
        <p className="my-properties-error">{error}</p>
      </div>
    );
  }

  if (isHostPendingApproval) {
    return (
      <div className="my-properties-page">
        <div className="my-properties-empty">
          <h3>Host Approval Pending</h3>
          <p>Your host account is waiting for admin approval.</p>
          <p>Once approved, your properties will appear here and you can add new listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-properties-page">
      <div className="my-properties-header">
        <h1>My Properties</h1>
        <p>Manage the stays you have listed for guests.</p>
      </div>

      {feedback && <p className="my-properties-feedback success">{feedback}</p>}
      {error && <p className="my-properties-feedback error">{error}</p>}

      {properties.length === 0 ? (
        <div className="my-properties-empty">
          <h3>No properties added yet</h3>
          <p>Your listed properties will appear here.</p>
          <Link to="/add-property" className="add-property-link">
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="my-properties-grid">
          {properties.map((property) => (
            <div className="my-property-card" key={property._id}>
              <img
                src={
                  property.images?.length > 0
                    ? property.images[0]
                    : "https://via.placeholder.com/400x250?text=No+Image"
                }
                alt={property.title}
                className="my-property-image"
              />

              <div className="my-property-content">
                <div className="my-property-top">
                  <h2>{property.title}</h2>
                  <span className="price-tag">₹{property.pricePerNight}/night</span>
                </div>

                <p className="my-property-location">{property.location}</p>
                <p className="my-property-description">{property.description}</p>

                <div className="my-property-info">
                  <div className="info-chip">Guests: {property.maxGuests}</div>
                  <div className="info-chip">
                    Amenities: {property.amenities?.length || 0}
                  </div>
                </div>

                <div className="amenities-list">
                  {property.amenities?.length > 0 ? (
                    property.amenities.slice(0, 4).map((item, index) => (
                      <span className="amenity-badge" key={index}>
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="amenity-badge">No amenities listed</span>
                  )}
                </div>

                <div className="my-property-actions">
                  <Link to={`/property/${property._id}`} className="property-btn view-btn">
                    View Details
                  </Link>
                  <button
                    type="button"
                    className="property-btn edit-btn"
                    onClick={() => handleEditStart(property)}
                  >
                    {editingId === property._id ? "Editing" : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="property-btn delete-btn"
                    onClick={() => handleDeleteProperty(property._id)}
                    disabled={deletingId === property._id}
                  >
                    {deletingId === property._id ? "Deleting..." : "Delete"}
                  </button>
                </div>

                {editingId === property._id && (
                  <div className="property-editor">
                    <div className="property-editor-grid">
                      <label>
                        <span>Title</span>
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                        />
                      </label>

                      <label>
                        <span>Location</span>
                        <input
                          name="location"
                          value={editForm.location}
                          onChange={handleEditChange}
                        />
                      </label>

                      <label>
                        <span>Price Per Night</span>
                        <input
                          type="number"
                          name="pricePerNight"
                          value={editForm.pricePerNight}
                          onChange={handleEditChange}
                          min="1"
                        />
                      </label>

                      <label>
                        <span>Max Guests</span>
                        <input
                          type="number"
                          name="maxGuests"
                          value={editForm.maxGuests}
                          onChange={handleEditChange}
                          min="1"
                        />
                      </label>

                      <label className="full-span">
                        <span>Description</span>
                        <textarea
                          rows="4"
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                        />
                      </label>

                      <label className="full-span">
                        <span>Amenities</span>
                        <input
                          name="amenities"
                          value={editForm.amenities}
                          onChange={handleEditChange}
                          placeholder="WiFi, AC, Pool"
                        />
                      </label>

                      <label className="full-span upload-field">
                        <span>Upload More Images</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleEditImageUpload}
                        />
                        {uploading && <small>Uploading images...</small>}
                      </label>
                    </div>

                    <div className="editor-image-list">
                      {editForm.images.map((image) => (
                        <div className="editor-image-card" key={image}>
                          <img src={image} alt="Property" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveImage(image)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="editor-actions">
                      <button
                        type="button"
                        className="property-btn save-btn"
                        onClick={() => handleSaveProperty(property._id)}
                        disabled={savingId === property._id || uploading}
                      >
                        {savingId === property._id ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="property-btn cancel-edit-btn"
                        onClick={resetEditForm}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pager">
          <span className="page-indicator">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

export default MyProperties;
