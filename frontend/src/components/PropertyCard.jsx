import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../services/wishlistService";
import "../styles/PropertyCard.css";

function PropertyCard({ property }) {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) return;

        const wishlist = await getWishlist();
        const exists = wishlist.some((item) => item._id === property._id);
        setIsWishlisted(exists);
      } catch (error) {
        console.error("Failed to load wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [property._id]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userInfo = localStorage.getItem("userInfo");

    if (!userInfo) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      if (isWishlisted) {
        await removeFromWishlist(property._id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(property._id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-card">
      <button
        className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
        onClick={handleWishlistClick}
        disabled={loading}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isWishlisted ? "♥" : "♡"}
      </button>

      <img
        src={
          property.images && property.images.length > 0
            ? property.images[0]
            : "https://via.placeholder.com/400x250?text=No+Image"
        }
        alt={property.title}
        className="property-image"
      />

      <div className="property-content">
        <h3>{property.title}</h3>
        <p className="property-location">{property.location}</p>
        <p className="property-price">₹{property.pricePerNight} / night</p>
        <p className="property-guests">Guests: {property.maxGuests}</p>

        <Link to={`/property/${property._id}`} className="details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default PropertyCard;