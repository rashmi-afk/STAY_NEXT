import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookingById } from "../services/bookingService";
import {
  completePayment,
  createPayment,
} from "../services/paymentService";
import "../styles/PaymentPage.css";

function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setBookingLoading(true);
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load booking");
      } finally {
        setBookingLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const paymentData = await createPayment({
        bookingId,
        paymentMethod,
      });

      await completePayment(paymentData.payment._id);

      setBooking((prevBooking) => ({
        ...prevBooking,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
      }));
      setSuccess("Payment successful! Redirecting to your bookings...");

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete payment");
    } finally {
      setLoading(false);
    }
  };

  if (bookingLoading) {
    return <p className="payment-message">Loading booking details...</p>;
  }

  if (!booking) {
    return (
      <p className="payment-message payment-error">
        {error || "Booking not found"}
      </p>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-header">
          <h1>Complete Your Payment</h1>
          <p>Choose a payment method to confirm your booking.</p>
        </div>

        <div className="payment-booking-box">
          <h3>Booking Summary</h3>
          <p>
            <strong>Property:</strong> {booking.property?.title}
          </p>
          <p>
            <strong>Location:</strong> {booking.property?.location}
          </p>
          <p>
            <strong>Check-in:</strong>{" "}
            {new Date(booking.checkIn).toLocaleDateString("en-IN")}
          </p>
          <p>
            <strong>Check-out:</strong>{" "}
            {new Date(booking.checkOut).toLocaleDateString("en-IN")}
          </p>
          <p>
            <strong>Guests:</strong> {booking.guests}
          </p>
          <p>
            <strong>Total Price:</strong> Rs. {booking.totalPrice}
          </p>
          <p>
            <strong>Booking Status:</strong> {booking.bookingStatus}
          </p>
          <p>
            <strong>Payment Status:</strong> {booking.paymentStatus}
          </p>
        </div>

        <form className="payment-form" onSubmit={handlePayment}>
          {error && <p className="payment-message payment-error">{error}</p>}
          {success && (
            <p className="payment-message payment-success">{success}</p>
          )}

          <label htmlFor="paymentMethod">Payment Method</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loading || booking.paymentStatus === "paid"}
          >
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="wallet">Wallet</option>
            <option value="cash">Cash</option>
          </select>

          <button
            type="submit"
            disabled={loading || booking.paymentStatus === "paid"}
          >
            {loading
              ? "Confirming Payment..."
              : booking.paymentStatus === "paid"
              ? "Already Paid"
              : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentPage;

