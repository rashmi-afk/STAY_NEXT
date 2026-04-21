import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import "../styles/MyBookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    try {
      setActionLoading(bookingId);
      await cancelBooking(bookingId);

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                bookingStatus: "cancelled",
                paymentStatus:
                  booking.paymentStatus === "pending" ? "failed" : booking.paymentStatus,
              }
            : booking
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <p className="bookings-message">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-page">
        <p className="bookings-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Manage your trips and stay updates</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bookings-empty">
          <h3>No bookings found</h3>
          <p>Your booked stays will appear here.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div className="booking-card" key={booking._id}>
              <div className="booking-image-wrapper">
                <img
                  src={
                    booking.property?.images?.length > 0
                      ? booking.property.images[0]
                      : "https://via.placeholder.com/350x220?text=No+Image"
                  }
                  alt={booking.property?.title || "Property"}
                  className="booking-image"
                />
              </div>

              <div className="booking-content">
                <div className="booking-top">
                  <div>
                    <h2>{booking.property?.title || "Property"}</h2>
                    <p className="booking-location">
                      {booking.property?.location || "Location not available"}
                    </p>
                  </div>

                  <div className="booking-badges">
                    <span className={`badge ${booking.bookingStatus}`}>
                      {booking.bookingStatus}
                    </span>
                    <span className={`badge ${booking.paymentStatus}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="booking-info-grid">
                  <div className="info-box">
                    <span className="info-label">Check-in</span>
                    <span className="info-value">{formatDate(booking.checkIn)}</span>
                  </div>

                  <div className="info-box">
                    <span className="info-label">Check-out</span>
                    <span className="info-value">{formatDate(booking.checkOut)}</span>
                  </div>

                  <div className="info-box">
                    <span className="info-label">Guests</span>
                    <span className="info-value">{booking.guests}</span>
                  </div>

                  <div className="info-box">
                    <span className="info-label">Total Price</span>
                    <span className="info-value">₹{booking.totalPrice}</span>
                  </div>
                </div>

                <div className="booking-actions">
                  <Link
                    to={`/property/${booking.property?._id}`}
                    className="view-property-btn"
                  >
                    View Property
                  </Link>

                  {booking.bookingStatus !== "cancelled" && (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={actionLoading === booking._id}
                    >
                      {actionLoading === booking._id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;