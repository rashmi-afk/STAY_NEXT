import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPropertyById } from "../services/propertyService";
import { createBooking, getMyBookings } from "../services/bookingService";
import { createReview, getPropertyReviews } from "../services/reviewService";
import "../styles/PropertyDetails.css";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
  });
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewableBookings, setReviewableBookings] = useState([]);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const [reviewForm, setReviewForm] = useState({
    bookingId: "",
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch property");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    const loadReviewableBookings = async () => {
      if (!localStorage.getItem("userInfo")) return;

      try {
        const data = await getMyBookings();
        const matches = (data.items || []).filter(
          (booking) =>
            booking.property?._id === id &&
            (booking.bookingStatus || booking.status) === "confirmed"
        );
        setReviewableBookings(matches);
      } catch {
        setReviewableBookings([]);
      }
    };

    loadReviewableBookings();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        const data = await getPropertyReviews(id);
        setReviews(data.reviews || []);
        setReviewStats({
          totalReviews: data.totalReviews || 0,
          averageRating: data.averageRating || 0,
        });
      } catch (err) {
        setReviewError(err.response?.data?.message || "Failed to fetch reviews");
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleBookingChange = (e) => {
    setBookingData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "guests" ? Number(e.target.value) : e.target.value,
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError("");

    const userInfo = localStorage.getItem("userInfo");

    if (!userInfo) {
      navigate("/login");
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError("Please select check-in and check-out dates");
      return;
    }

    try {
      setBookingLoading(true);

      const response = await createBooking({
        propertyId: id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
      });

      navigate(`/payment/${response.booking._id}`);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewChange = (e) => {
    setReviewForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleStarClick = (value) => {
    setReviewForm((prev) => ({
      ...prev,
      rating: value,
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!localStorage.getItem("userInfo")) {
      navigate("/login");
      return;
    }

    if (!reviewForm.bookingId || !reviewForm.rating || !reviewForm.comment) {
      setReviewError("Booking ID, rating and comment are required");
      return;
    }

    try {
      await createReview({
        bookingId: reviewForm.bookingId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      setReviewSuccess("Review submitted successfully");

      setReviewForm({
        bookingId: "",
        rating: 0,
        comment: "",
      });

      const data = await getPropertyReviews(id);
      setReviews(data.reviews || []);
      setReviewStats({
        totalReviews: data.totalReviews || 0,
        averageRating: data.averageRating || 0,
      });
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    }
  };

  const renderStars = (rating, clickable = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= rating ? "filled" : ""} ${clickable ? "clickable" : ""}`}
        onClick={clickable ? () => handleStarClick(star) : undefined}
      >
        ★
      </span>
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <p className="details-message">Loading...</p>;
  }

  if (error) {
    return <p className="details-error">{error}</p>;
  }

  return (
    <div className="details-page">
      <div className="details-container">
        <div className="details-left">
          <h1>{property.title}</h1>

          <div className="rating-summary">
            <div className="rating-stars">
              {renderStars(Math.round(reviewStats.averageRating))}
            </div>
            <span className="rating-text">
              {reviewStats.averageRating || 0} · {reviewStats.totalReviews} reviews
            </span>
          </div>

          <img
            src={
              property.images?.length > 0
                ? property.images[0]
                : "https://via.placeholder.com/600x400?text=No+Image"
            }
            alt={property.title}
            className="details-image"
          />

          <p className="details-location">📍 {property.location}</p>
          <p className="details-price">₹{property.pricePerNight} / night</p>
          <p className="details-guests">Guests allowed: {property.maxGuests}</p>
          <p className="details-description">{property.description}</p>

          <div className="details-amenities">
            <h3>Amenities</h3>
            <ul>
              {property.amenities?.length > 0 ? (
                property.amenities.map((item, index) => <li key={index}>{item}</li>)
              ) : (
                <li>No amenities listed</li>
              )}
            </ul>
          </div>

          <div className="reviews-section">
            <div className="reviews-header">
              <h2>Guest Reviews</h2>
              <p>See what other guests are saying about this stay.</p>
            </div>

            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h3>Write a Review</h3>

              {reviewError && <p className="review-message error">{reviewError}</p>}
              {reviewSuccess && <p className="review-message success">{reviewSuccess}</p>}

              <div className="review-form-group">
                <label htmlFor="bookingId">Booking ID</label>
                <select
                  id="bookingId"
                  name="bookingId"
                  value={reviewForm.bookingId}
                  onChange={handleReviewChange}
                >
                  <option value="">Select a confirmed booking</option>
                  {reviewableBookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="review-form-group">
                <label>Your Rating</label>
                <div className="star-input">
                  {renderStars(reviewForm.rating, true)}
                </div>
              </div>

              <div className="review-form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="4"
                  placeholder="Share your experience"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                />
              </div>

              <button type="submit" className="review-submit-btn">
                Submit Review
              </button>
            </form>

            <div className="review-list">
              {reviewLoading ? (
                <p className="details-message">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div className="no-reviews-box">
                  <h4>No reviews yet</h4>
                  <p>Be the first guest to leave a review for this property.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div className="review-card" key={review._id}>
                    <div className="review-card-top">
                      <div>
                        <h4>{review.user?.name || "Guest"}</h4>
                        <p>{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="review-card-stars">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="details-right">
          <div className="booking-card">
            <h2>Book this stay</h2>

            {bookingError && <p className="booking-error">{bookingError}</p>}

            <form onSubmit={handleBooking} className="booking-form">
              <label>Check-in</label>
              <input
                type="date"
                name="checkIn"
                value={bookingData.checkIn}
                onChange={handleBookingChange}
                min={new Date().toISOString().split("T")[0]}
              />

              <label>Check-out</label>
              <input
                type="date"
                name="checkOut"
                value={bookingData.checkOut}
                onChange={handleBookingChange}
                min={bookingData.checkIn || new Date().toISOString().split("T")[0]}
              />

              <label>Guests</label>
              <input
                type="number"
                name="guests"
                value={bookingData.guests}
                onChange={handleBookingChange}
                min="1"
                max={property.maxGuests}
              />

              <button type="submit" disabled={bookingLoading}>
                {bookingLoading ? "Booking..." : "Book Now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
