import { useEffect, useState } from "react";
import {
  getMyTickets,
  createTicket,
} from "../services/ticketService";
import "../styles/MyTickets.css";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    if (!subject || !message) {
      setError("Please fill all fields");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await createTicket({ subject, message });

      setSubject("");
      setMessage("");

      fetchTickets();
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

      {/* Create Ticket */}
      <form className="ticket-form" onSubmit={handleCreateTicket}>
        {error && <p className="ticket-error">{error}</p>}

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