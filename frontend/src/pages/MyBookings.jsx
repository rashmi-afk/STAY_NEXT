import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyBookings,
  cancelBooking,
  punchInBooking,
  punchOutBooking,
} from "../services/bookingService";
import "../styles/MyBookings.css";

const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

function MyBookings() {
  const userInfo = getUserInfo();
  const guestName = userInfo?.name || "Guest";
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchBookings = async (page = 1, options = {}) => {
    const { background = false } = options;
    try {
      if (!background) {
        setLoading(true);
      }
      const data = await getMyBookings(page);
      setBookings(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings(pagination.page || 1, { background: true });
    }, 30000);

    return () => clearInterval(interval);
  }, [pagination.page]);

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
                status: "cancelled",
                stayStatus: "cancelled",
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

  const handleStayAction = async (bookingId, action) => {
    try {
      setActionLoading(`${action}-${bookingId}`);
      const response =
        action === "punch-in"
          ? await punchInBooking(bookingId)
          : await punchOutBooking(bookingId);

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                stayStatus: response.booking.stayStatus,
                actualCheckInTime:
                  response.booking.actualCheckInTime || booking.actualCheckInTime,
                actualCheckOutTime:
                  response.booking.actualCheckOutTime || booking.actualCheckOutTime,
              }
            : booking
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stay status");
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

  const getBookingStatus = (booking) => booking.bookingStatus || booking.status || "pending";
  const getPaymentStatus = (booking) => booking.paymentStatus || "pending";
  const formatDateTime = (date) => {
    if (!date) return "Not recorded";

    return new Date(date).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getStayStatus = (booking) => {
    const bookingStatus = getBookingStatus(booking);
    const paymentStatus = getPaymentStatus(booking);

    if (bookingStatus === "cancelled") {
      return "cancelled";
    }

    if (booking.actualCheckOutTime) {
      return "checked-out";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDay = new Date(booking.checkIn);
    checkInDay.setHours(0, 0, 0, 0);

    const checkOutDay = new Date(booking.checkOut);
    checkOutDay.setHours(0, 0, 0, 0);

    if (booking.actualCheckInTime) {
      if (today >= checkOutDay) {
        return "ready-for-check-out";
      }

      return "checked-in";
    }

    if (bookingStatus === "confirmed" && paymentStatus === "paid" && today >= checkInDay) {
      return "ready-for-check-in";
    }

    return booking.stayStatus || "upcoming";
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
        <p className="bookings-user-name">Signed in as {guestName}</p>
        <p>Manage your trips, stay updates, and check-in reminders.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bookings-empty">
          <h3>No bookings found</h3>
          <p>Your booked stays will appear here.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const bookingStatus = getBookingStatus(booking);
            const paymentStatus = getPaymentStatus(booking);
            const stayStatus = getStayStatus(booking);
            const isPunchInLoading = actionLoading === `punch-in-${booking._id}`;
            const isPunchOutLoading = actionLoading === `punch-out-${booking._id}`;

            return (
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
                      <span className={`badge ${bookingStatus}`}>
                        {bookingStatus}
                      </span>
                      <span className={`badge ${paymentStatus}`}>
                        {paymentStatus}
                      </span>
                      <span className={`badge ${stayStatus}`}>
                        {stayStatus}
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
                      <span className="info-label">Punch In</span>
                      <span className="info-value">{formatDateTime(booking.actualCheckInTime)}</span>
                    </div>

                    <div className="info-box">
                      <span className="info-label">Punch Out</span>
                      <span className="info-value">{formatDateTime(booking.actualCheckOutTime)}</span>
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

                    {stayStatus === "ready-for-check-in" && (
                      <button
                        className="stay-action-btn"
                        onClick={() => handleStayAction(booking._id, "punch-in")}
                        disabled={isPunchInLoading}
                      >
                        {isPunchInLoading ? "Punching In..." : "Punch In"}
                      </button>
                    )}

                    {stayStatus === "ready-for-check-out" && (
                      <button
                        className="stay-action-btn checkout"
                        onClick={() => handleStayAction(booking._id, "punch-out")}
                        disabled={isPunchOutLoading}
                      >
                        {isPunchOutLoading ? "Punching Out..." : "Punch Out"}
                      </button>
                    )}

                    {bookingStatus !== "cancelled" && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={
                          actionLoading === booking._id ||
                          isPunchInLoading ||
                          isPunchOutLoading
                        }
                      >
                        {actionLoading === booking._id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pager">
          <button
            type="button"
            className="clear-btn"
            onClick={() => fetchBookings(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </button>
          <span className="page-indicator">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="search-btn"
            onClick={() => fetchBookings(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
