import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookingById } from "../services/bookingService";
import {
  completePayment,
  createPayment,
} from "../services/paymentService";
import "../styles/PaymentPage.css";

const paymentMethodLabels = {
  card: "Card",
  upi: "UPI",
  netbanking: "Net Banking",
  wallet: "Wallet",
  cash: "Cash at Property",
};

const bankOptions = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak"];
const walletOptions = ["PhonePe Wallet", "Amazon Pay", "Mobikwik", "Paytm"];

function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardName, setCardName] = useState("Rashmi Ranjan Rout");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [upiId, setUpiId] = useState("staynextdemo@upi");
  const [selectedBank, setSelectedBank] = useState(bankOptions[0]);
  const [selectedWallet, setSelectedWallet] = useState(walletOptions[0]);

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

  const bookingStatus = booking?.bookingStatus || booking?.status || "pending";
  const paymentStatus = booking?.paymentStatus || "pending";

  const openDemoCheckout = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowDemoModal(true);
  };

  const closeDemoCheckout = () => {
    if (loading) {
      return;
    }

    setShowDemoModal(false);
  };

  const handleDemoFailure = () => {
    setShowDemoModal(false);
    setSuccess("");
    setError(
      "Demo payment failed. No money was charged. You can retry and use the success flow during your presentation."
    );
  };

  const handleDemoSuccess = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const paymentData = await createPayment({
        bookingId,
        paymentMethod,
      });

      const completedPayment = await completePayment(paymentData.payment._id);

      setBooking((prevBooking) => ({
        ...prevBooking,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        status: "confirmed",
      }));
      setTransactionDetails({
        transactionId: completedPayment.payment.transactionId,
        method: paymentMethodLabels[paymentMethod],
        amount: completedPayment.payment.amount,
        paidAt: new Date().toLocaleString("en-IN"),
      });
      setShowDemoModal(false);
      setSuccess(
        "Demo payment successful. Booking confirmed and receipt generated. Redirecting to your bookings..."
      );

      setTimeout(() => {
        navigate("/my-bookings");
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete payment");
    } finally {
      setLoading(false);
    }
  };

  const renderDemoFields = () => {
    if (paymentMethod === "card") {
      return (
        <div className="demo-section">
          <div className="demo-card-visual">
            <span className="demo-card-chip" />
            <p>{cardNumber}</p>
            <div>
              <span>{cardName}</span>
              <span>{expiry}</span>
            </div>
          </div>

          <div className="demo-field-grid">
            <label>
              Card Number
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </label>

            <label>
              Name on Card
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </label>

            <label>
              Expiry
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </label>

            <label>
              CVV
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </label>
          </div>
        </div>
      );
    }

    if (paymentMethod === "upi") {
      return (
        <div className="demo-section">
          <div className="demo-qr-layout">
            <div className="demo-qr-box">
              <div className="demo-qr-grid">
                {Array.from({ length: 25 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
              <p>Scan this demo QR in your presentation</p>
            </div>

            <div className="demo-upi-box">
              <label>
                UPI ID
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </label>
              <div className="demo-app-pills">
                <span>GPay</span>
                <span>PhonePe</span>
                <span>Paytm</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (paymentMethod === "netbanking") {
      return (
        <div className="demo-section">
          <label>
            Choose Bank
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              {bankOptions.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </label>
          <div className="demo-note-box">
            <strong>Demo Redirect</strong>
            <p>
              We will simulate a secure bank redirect and return you to the
              booking confirmation page.
            </p>
          </div>
        </div>
      );
    }

    if (paymentMethod === "wallet") {
      return (
        <div className="demo-section">
          <label>
            Choose Wallet
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
            >
              {walletOptions.map((wallet) => (
                <option key={wallet} value={wallet}>
                  {wallet}
                </option>
              ))}
            </select>
          </label>
          <div className="demo-wallet-grid">
            {walletOptions.map((wallet) => (
              <button
                key={wallet}
                type="button"
                className={`wallet-pill ${
                  selectedWallet === wallet ? "active" : ""
                }`}
                onClick={() => setSelectedWallet(wallet)}
              >
                {wallet}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="demo-section">
        <div className="demo-note-box">
          <strong>Cash at Property</strong>
          <p>
            This demo option confirms the booking instantly and treats the
            payment as collected at check-in for presentation purposes.
          </p>
        </div>
        <ul className="demo-bullet-list">
          <li>Front desk confirmation number will be generated.</li>
          <li>No online payment is charged in this demo flow.</li>
          <li>Booking still moves to confirmed for your walkthrough.</li>
        </ul>
      </div>
    );
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
          <span className="payment-demo-badge">Demo Checkout</span>
          <h1>Review And Complete Your Booking</h1>
          <p>
            Realistic payment UI for project demos. No real money is charged and
            your booking still follows the full confirmation flow.
          </p>
        </div>

        <div className="payment-highlights">
          <span>UPI</span>
          <span>Cards</span>
          <span>Net Banking</span>
          <span>Wallets</span>
          <span>Demo QR</span>
        </div>

        <div className="payment-booking-box">
          <div className="summary-top">
            <div>
              <h3>Booking Summary</h3>
              <p className="summary-subtitle">
                Confirm the details before opening the demo checkout.
              </p>
            </div>
            <div className="summary-price">Rs. {booking.totalPrice}</div>
          </div>

          <div className="summary-grid">
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
              <strong>Booking Status:</strong> {bookingStatus}
            </p>
            <p>
              <strong>Payment Status:</strong> {paymentStatus}
            </p>
            <p>
              <strong>Demo Security:</strong> Server-confirmed booking flow
            </p>
          </div>
        </div>

        <form className="payment-form" onSubmit={openDemoCheckout}>
          {error && <p className="payment-message payment-error">{error}</p>}
          {success && (
            <p className="payment-message payment-success">{success}</p>
          )}

          {transactionDetails && (
            <div className="payment-receipt">
              <div>
                <span className="receipt-label">Transaction ID</span>
                <strong>{transactionDetails.transactionId}</strong>
              </div>
              <div>
                <span className="receipt-label">Paid Using</span>
                <strong>{transactionDetails.method}</strong>
              </div>
              <div>
                <span className="receipt-label">Amount</span>
                <strong>Rs. {transactionDetails.amount}</strong>
              </div>
              <div>
                <span className="receipt-label">Timestamp</span>
                <strong>{transactionDetails.paidAt}</strong>
              </div>
            </div>
          )}

          <label htmlFor="paymentMethod">Payment Method</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loading || paymentStatus === "paid"}
          >
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="wallet">Wallet</option>
            <option value="cash">Cash at Property</option>
          </select>

          <div className="demo-preview-line">
            <span>Selected Flow</span>
            <strong>{paymentMethodLabels[paymentMethod]}</strong>
          </div>

          <button
            type="submit"
            disabled={loading || paymentStatus === "paid"}
          >
            {loading
              ? "Processing Demo Payment..."
              : paymentStatus === "paid"
                ? "Already Paid"
                : "Open Demo Checkout"}
          </button>
        </form>
      </div>

      {showDemoModal && (
        <div className="payment-modal-overlay" onClick={closeDemoCheckout}>
          <div
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payment-modal-header">
              <div>
                <span className="payment-demo-badge">Secure Demo</span>
                <h2>{paymentMethodLabels[paymentMethod]} Checkout</h2>
                <p>
                  This simulates a full payment gateway experience while keeping
                  the project free, local, and presentation-friendly.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeDemoCheckout}
                disabled={loading}
              >
                Close
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="payment-modal-main">{renderDemoFields()}</div>

              <aside className="payment-modal-sidebar">
                <div className="sidebar-panel">
                  <h3>Order Snapshot</h3>
                  <p>{booking.property?.title}</p>
                  <p>{booking.property?.location}</p>
                  <div className="sidebar-amount">Rs. {booking.totalPrice}</div>
                </div>

                <div className="sidebar-panel">
                  <h3>What This Demo Shows</h3>
                  <ul className="demo-bullet-list">
                    <li>Method selection and realistic checkout UI</li>
                    <li>Server-side booking confirmation flow</li>
                    <li>Transaction receipt details after success</li>
                    <li>Failure simulation without charging money</li>
                  </ul>
                </div>
              </aside>
            </div>

            <div className="payment-modal-actions">
              <button
                type="button"
                className="secondary-action-btn"
                onClick={handleDemoFailure}
                disabled={loading}
              >
                Simulate Failure
              </button>
              <button
                type="button"
                className="primary-action-btn"
                onClick={handleDemoSuccess}
                disabled={loading}
              >
                {loading ? "Confirming..." : "Simulate Successful Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
