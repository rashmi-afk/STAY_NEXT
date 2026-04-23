import { useEffect, useState } from "react";
import { getHostBookings } from "../services/bookingService";
import "../styles/BackOffice.css";

const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

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

function HostBookings() {
  const userInfo = getUserInfo();
  const hostName = userInfo?.name || "Host";
  const isHostPendingApproval =
    userInfo?.role === "host" && userInfo?.hostApprovalStatus !== "approved";
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async (options = {}) => {
    const { background = false } = options;
    try {
      if (!background) {
        setLoading(true);
      }
      const data = await getHostBookings();
      setBookings(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load host bookings");
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isHostPendingApproval) {
      setLoading(false);
      setError("");
      return;
    }

    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings({ background: true });
    }, 30000);

    return () => clearInterval(interval);
  }, [isHostPendingApproval]);

  const paidCount = bookings.filter(
    (booking) => getPaymentStatus(booking) === "paid"
  ).length;
  const revenue = bookings
    .filter((booking) => getPaymentStatus(booking) === "paid")
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  if (loading) {
    return <p className="backoffice-message">Loading host bookings...</p>;
  }

  if (error) {
    return <p className="backoffice-error">{error}</p>;
  }

  if (isHostPendingApproval) {
    return (
      <div className="backoffice-page">
        <div className="backoffice-empty">
          <h3>Host Approval Pending</h3>
          <p>Your host account is waiting for admin approval.</p>
          <p>After approval, bookings for your properties will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backoffice-page">
      <div className="backoffice-header">
        <div>
          <p className="backoffice-kicker">Host Center</p>
          <h1>Bookings For My Properties</h1>
          <p className="dashboard-user-name">Signed in as {hostName}</p>
          <p>See who booked your stays and whether payment is still pending or already completed.</p>
          <p className="muted-text">This page refreshes automatically every 30 seconds.</p>
        </div>
      </div>

      <div className="backoffice-stats">
        <div className="stat-card">
          <span>Total Bookings</span>
          <strong>{pagination.total || bookings.length}</strong>
        </div>
        <div className="stat-card">
          <span>Paid Bookings</span>
          <strong>{paidCount}</strong>
        </div>
        <div className="stat-card">
          <span>Revenue Received</span>
          <strong>Rs. {revenue}</strong>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="backoffice-empty">
          <h3>No bookings yet</h3>
          <p>When guests book your properties, their booking and payment status will appear here.</p>
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
                    <span className="meta-label">Stay Dates</span>
                    <strong>
                      {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                    </strong>
                    <p>{booking.guests} guest(s)</p>
                  </div>
                  <div>
                    <span className="meta-label">Amount</span>
                    <strong>Rs. {booking.totalPrice}</strong>
                    <p>Booked on {formatDate(booking.createdAt)}</p>
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

export default HostBookings;
