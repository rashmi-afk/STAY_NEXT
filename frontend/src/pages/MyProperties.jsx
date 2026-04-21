import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProperties } from "../services/propertyService";
import "../styles/MyProperties.css";

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const data = await getMyProperties();
        setProperties(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch your properties");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  if (loading) {
    return (
      <div className="my-properties-page">
        <p className="my-properties-message">Loading your properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-properties-page">
        <p className="my-properties-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="my-properties-page">
      <div className="my-properties-header">
        <h1>My Properties</h1>
        <p>Manage the stays you have listed for guests.</p>
      </div>

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProperties;