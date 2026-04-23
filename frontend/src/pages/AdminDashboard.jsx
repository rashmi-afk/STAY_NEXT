import { useEffect, useState } from "react";
import { getAllBookings } from "../services/bookingService";
import { getAllPayments } from "../services/paymentService";
import "../styles/BackOffice.css";

const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

function AdminDashboard() {
  const userInfo = getUserInfo();
  const adminName = userInfo?.name || "Admin";
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async (options = {}) => {
    const { background = false } = options;
    try {
      if (!background) {
        setLoading(true);
      }
      const [bookingData, paymentData] = await Promise.all([
        getAllBookings(),
        getAllPayments(),
      ]);
      setBookings(bookingData.items || []);
      setPayments(paymentData.items || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => {
      loadDashboard({ background: true });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const successfulPayments = payments.filter(
    (payment) => payment.status === "successful"
  );
  const pendingPayments = payments.filter((payment) => payment.status === "pending");
  const totalRevenue = successfulPayments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );
  const currentMonth = new Date().getMonth();
  const monthlyRevenue = successfulPayments
    .filter((payment) => new Date(payment.createdAt).getMonth() === currentMonth)
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const occupancyRate = bookings.length
    ? Math.round((successfulPayments.length / bookings.length) * 100)
    : 0;

  if (loading) {
    return <p className="backoffice-message">Loading admin dashboard...</p>;
  }

  if (error) {
    return <p className="backoffice-error">{error}</p>;
  }

  return (
    <div className="backoffice-page">
      <div className="backoffice-header">
        <div>
          <p className="backoffice-kicker">Admin Overview</p>
          <h1>Platform Booking And Payment Summary</h1>
          <p className="dashboard-user-name">Signed in as {adminName}</p>
          <p>Track bookings, payment completion, and revenue across the full StayNext platform.</p>
          <p className="muted-text">This dashboard refreshes automatically every 30 seconds.</p>
        </div>
      </div>

      <div className="backoffice-stats">
        <div className="stat-card">
          <span>Total Bookings</span>
          <strong>{bookings.length}</strong>
        </div>
        <div className="stat-card">
          <span>Successful Payments</span>
          <strong>{successfulPayments.length}</strong>
        </div>
        <div className="stat-card">
          <span>Pending Payments</span>
          <strong>{pendingPayments.length}</strong>
        </div>
        <div className="stat-card">
          <span>Total Revenue</span>
          <strong>Rs. {totalRevenue}</strong>
        </div>
        <div className="stat-card">
          <span>This Month</span>
          <strong>Rs. {monthlyRevenue}</strong>
        </div>
        <div className="stat-card">
          <span>Occupancy Signal</span>
          <strong>{occupancyRate}%</strong>
        </div>
      </div>

      <section className="record-card">
        <div className="record-card-top">
          <div>
            <h2>Recent Paid Transactions</h2>
            <p>The latest completed payments visible to the admin team.</p>
          </div>
        </div>

        {successfulPayments.length === 0 ? (
          <div className="backoffice-empty compact">
            <p>No completed payments yet.</p>
          </div>
        ) : (
          <div className="table-scroll inline-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Guest</th>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {successfulPayments.slice(0, 6).map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.transactionId}</td>
                    <td>{payment.user?.name || "Guest"}</td>
                    <td>{payment.booking?.property?.title || "Property"}</td>
                    <td>Rs. {payment.amount}</td>
                    <td>{payment.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
