import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import "../styles/Wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const userInfo = localStorage.getItem("userInfo");

        if (!userInfo) {
          navigate("/login");
          return;
        }

        const data = await getWishlist();
        setWishlist(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  const handleRemove = async (propertyId) => {
    try {
      await removeFromWishlist(propertyId);
      setWishlist((prev) => prev.filter((item) => item._id !== propertyId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove property");
    }
  };

  if (loading) {
    return <p className="wishlist-message">Loading wishlist...</p>;
  }

  if (error) {
    return <p className="wishlist-error">{error}</p>;
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>Your saved favorite stays in one place.</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <h3>No properties saved yet</h3>
            <p>Start exploring and add properties to your wishlist.</p>
            <Link to="/" className="browse-btn">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((property) => (
              <div className="wishlist-card" key={property._id}>
                <img
                  src={
                    property.images?.length > 0
                      ? property.images[0]
                      : "https://via.placeholder.com/400x250?text=No+Image"
                  }
                  alt={property.title}
                  className="wishlist-image"
                />

                <div className="wishlist-content">
                  <h3>{property.title}</h3>
                  <p className="wishlist-location">{property.location}</p>
                  <p className="wishlist-price">₹{property.pricePerNight} / night</p>
                  <p className="wishlist-guests">Guests: {property.maxGuests}</p>

                  <div className="wishlist-actions">
                    <Link to={`/property/${property._id}`} className="wishlist-details-btn">
                      View Details
                    </Link>

                    <button
                      className="wishlist-remove-btn"
                      onClick={() => handleRemove(property._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
