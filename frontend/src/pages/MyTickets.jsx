import { useEffect, useState } from "react";
import { getMyTickets, createTicket } from "../services/ticketService";
import { getMyBookings } from "../services/bookingService";
import "../styles/MyTickets.css";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const canCreateTicket = userInfo?.role === "guest";

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const ticketData = await getMyTickets();
        setTickets(ticketData.items || []);
        setPagination(ticketData.pagination || { page: 1, totalPages: 1 });

        if (canCreateTicket) {
          const bookingData = await getMyBookings();
          const availableBookings = (bookingData.items || []).filter(
            (booking) => booking.property?._id
          );
          setBookings(availableBookings);

          if (availableBookings.length > 0) {
            setBookingId(availableBookings[0]._id);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!bookingId || !subject || !message) {
      setError("Please fill all fields");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await createTicket({ bookingId, subject, message });
      setTickets((prev) => [response.ticket, ...prev]);

      setBookingId(bookings[0]?._id || "");
      setSubject("");
      setMessage("");
      setSuccess("Ticket created successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="tickets-page">
        <p className="tickets-message">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="tickets-page">
      <div className="tickets-header">
        <h1>Support Tickets</h1>
        <p>Raise an issue or track your support requests</p>
      </div>

      {canCreateTicket &&
        (bookings.length === 0 ? (
          <div className="tickets-empty ticket-form">
            <h3>No bookings available for support</h3>
            <p>Create a booking first, then you can raise a ticket for that stay.</p>
          </div>
        ) : (
          <form className="ticket-form" onSubmit={handleCreateTicket}>
            {error && <p className="ticket-error">{error}</p>}
            {success && <p className="ticket-success">{success}</p>}

            <select value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
              {bookings.map((booking) => (
                <option key={booking._id} value={booking._id}>
                  {booking.property?.title || "Property"} - {booking.property?.location || "Location"}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Subject (Ex: Payment issue)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <textarea
              placeholder="Describe your issue..."
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button type="submit" disabled={creating}>
              {creating ? "Submitting..." : "Create Ticket"}
            </button>
          </form>
        ))}

      {/* Ticket List */}
      {tickets.length === 0 ? (
        <div className="tickets-empty">
          <h3>No tickets yet</h3>
          <p>Your support requests will appear here.</p>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <div className="ticket-card" key={ticket._id}>
              <div className="ticket-top">
                <h3>{ticket.subject}</h3>
                <span className={`ticket-status ${ticket.status}`}>
                  {ticket.status}
                </span>
              </div>

              <p className="ticket-message">{ticket.message}</p>
              <p className="ticket-meta">
                Stay: {ticket.property?.title || "Property"} | {ticket.property?.location || "Location"}
              </p>

              {ticket.adminReply ? (
                <div className="ticket-reply-box">
                  <strong>Admin Reply</strong>
                  <p>{ticket.adminReply}</p>
                </div>
              ) : (
                <p className="ticket-meta">Admin reply pending</p>
              )}

              <small>
                Created:{" "}
                {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;
