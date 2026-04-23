import { useEffect, useState } from "react";
import { getAllBookings } from "../services/bookingService";
import "../styles/BackOffice.css";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getBookingStatus = (booking) => booking.bookingStatus || booking.status || "pending";
const getPaymentStatus = (booking) => booking.paymentStatus || "pending";
const getStayStatus = (booking) => {
  if (booking.bookingStatus === "cancelled" || booking.status === "cancelled") {
    return "cancelled";
  }

  if (booking.actualCheckOutTime) {
    return "checked-out";
  }

  if (booking.actualCheckInTime) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOutDay = new Date(booking.checkOut);
    checkOutDay.setHours(0, 0, 0, 0);

    return today >= checkOutDay ? "ready-for-check-out" : "checked-in";
  }

  return booking.stayStatus || "upcoming";
};
const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not recorded";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async (options = {}) => {
    const { background = false } = options;
    try {
      if (!background) {
        setLoading(true);
      }
      const data = await getAllBookings();
      setBookings(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings({ background: true });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <p className="backoffice-message">Loading platform bookings...</p>;
  }

  if (error) {
    return <p className="backoffice-error">{error}</p>;
  }

  return (
    <div className="backoffice-page">
      <div className="backoffice-header">
        <div>
          <p className="backoffice-kicker">Admin Bookings</p>
          <h1>All Guest Bookings</h1>
          <p>Every booking now shows both booking status and payment status for platform verification.</p>
          <p className="muted-text">This page refreshes automatically every 30 seconds.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="backoffice-empty">
          <h3>No bookings found</h3>
          <p>Bookings created by guests will appear here for admin review.</p>
        </div>
      ) : (
        <div className="record-list">
          {bookings.map((booking) => {
            const bookingStatus = getBookingStatus(booking);
            const paymentStatus = getPaymentStatus(booking);
            const stayStatus = getStayStatus(booking);

            return (
              <article className="record-card" key={booking._id}>
                <div className="record-card-top">
                  <div>
                    <h2>{booking.property?.title || "Property"}</h2>
                    <p>{booking.property?.location || "Location unavailable"}</p>
                  </div>
                  <div className="status-stack">
                    <span className={`status-chip ${bookingStatus}`}>{bookingStatus}</span>
                    <span className={`status-chip ${paymentStatus}`}>{paymentStatus}</span>
                    <span className={`status-chip ${stayStatus}`}>{stayStatus}</span>
                  </div>
                </div>

                <div className="record-grid">
                  <div>
                    <span className="meta-label">Guest</span>
                    <strong>{booking.user?.name || "Guest"}</strong>
                    <p>{booking.user?.email || "No email"}</p>
                  </div>
                  <div>
                    <span className="meta-label">Host</span>
                    <strong>{booking.property?.host?.name || "Host"}</strong>
                    <p>{booking.property?.host?.email || "No email"}</p>
                  </div>
                  <div>
                    <span className="meta-label">Stay Dates</span>
                    <strong>
                      {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                    </strong>
                    <p>{booking.guests} guest(s)</p>
                  </div>
                  <div>
                    <span className="meta-label">Amount</span>
                    <strong>Rs. {booking.totalPrice}</strong>
                    <p>Created {formatDate(booking.createdAt)}</p>
                  </div>
                  <div>
                    <span className="meta-label">Punch In</span>
                    <strong>{formatDateTime(booking.actualCheckInTime)}</strong>
                  </div>
                  <div>
                    <span className="meta-label">Punch Out</span>
                    <strong>{formatDateTime(booking.actualCheckOutTime)}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
