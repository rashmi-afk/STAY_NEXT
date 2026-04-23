import { useEffect, useState } from "react";
import { getAllPayments } from "../services/paymentService";
import "../styles/BackOffice.css";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getAllPayments();
        setPayments(data.items || []);
        setPagination(data.pagination || { page: 1, totalPages: 1 });
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <p className="backoffice-message">Loading all payments...</p>;
  }

  if (error) {
    return <p className="backoffice-error">{error}</p>;
  }

  return (
    <div className="backoffice-page">
      <div className="backoffice-header">
        <div>
          <p className="backoffice-kicker">Admin Payments</p>
          <h1>All Payment Records</h1>
          <p>Admins can verify who paid, for which property, how much was charged, and the payment result.</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="backoffice-empty">
          <h3>No payments found</h3>
          <p>Successful, pending, and failed payment records will appear here.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Guest</th>
                <th>Host</th>
                <th>Property</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.transactionId}</td>
                  <td>
                    <strong>{payment.user?.name || "Guest"}</strong>
                    <div>{payment.user?.email || "No email"}</div>
                  </td>
                  <td>
                    <strong>{payment.booking?.property?.host?.name || "Host"}</strong>
                    <div>{payment.booking?.property?.host?.email || "No email"}</div>
                  </td>
                  <td>
                    <strong>{payment.booking?.property?.title || "Property"}</strong>
                    <div>{payment.booking?.property?.location || "No location"}</div>
                  </td>
                  <td>Rs. {payment.amount}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>
                    <span className={`status-chip ${payment.status}`}>{payment.status}</span>
                  </td>
                  <td>{formatDateTime(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;
