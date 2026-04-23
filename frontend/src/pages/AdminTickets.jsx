import { useEffect, useState } from "react";
import { getAllTickets, updateTicket } from "../services/ticketService";
import "../styles/BackOffice.css";

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await getAllTickets();
        setTickets(data.items || []);
        setPagination(data.pagination || { page: 1, totalPages: 1 });
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleFieldChange = (ticketId, field, value) => {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, [field]: value } : ticket
      )
    );
  };

  const handleSave = async (ticket) => {
    try {
      setSavingId(ticket._id);
      const response = await updateTicket(ticket._id, {
        status: ticket.status,
        adminReply: ticket.adminReply,
      });

      setTickets((currentTickets) =>
        currentTickets.map((item) =>
          item._id === ticket._id
            ? {
                ...item,
                status: response.ticket.status,
                adminReply: response.ticket.adminReply,
                updatedAt: response.ticket.updatedAt,
              }
            : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update ticket");
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return <p className="backoffice-message">Loading admin tickets...</p>;
  }

  if (error) {
    return <p className="backoffice-error">{error}</p>;
  }

  return (
    <div className="backoffice-page">
      <div className="backoffice-header">
        <div>
          <p className="backoffice-kicker">Admin Support</p>
          <h1>Ticket Management</h1>
          <p>Review guest support issues, update status, and reply from the admin workspace.</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="backoffice-empty">
          <h3>No tickets found</h3>
          <p>Support tickets raised by users will appear here.</p>
        </div>
      ) : (
        <div className="record-list">
          {tickets.map((ticket) => (
            <article className="record-card" key={ticket._id}>
              <div className="record-card-top">
                <div>
                  <h2>{ticket.subject}</h2>
                  <p>
                    {ticket.user?.name || "User"} - {ticket.property?.title || "Property"}
                  </p>
                </div>
                <span className={`status-chip ${ticket.status}`}>{ticket.status}</span>
              </div>

              <div className="record-grid">
                <div className="span-2">
                  <span className="meta-label">User Message</span>
                  <p>{ticket.message}</p>
                </div>
                <div>
                  <span className="meta-label">Status</span>
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      handleFieldChange(ticket._id, "status", e.target.value)
                    }
                  >
                    <option value="open">open</option>
                    <option value="in-progress">in-progress</option>
                    <option value="resolved">resolved</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
                <div>
                  <span className="meta-label">Admin Reply</span>
                  <textarea
                    rows="3"
                    value={ticket.adminReply || ""}
                    onChange={(e) =>
                      handleFieldChange(ticket._id, "adminReply", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="record-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => handleSave(ticket)}
                  disabled={savingId === ticket._id}
                >
                  {savingId === ticket._id ? "Saving..." : "Save Update"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminTickets;
