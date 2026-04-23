import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { askAssistant } from "../services/assistantService";
import { getMyBookings } from "../services/bookingService";
import { createTicket } from "../services/ticketService";
import "../styles/BookingHelpAssistant.css";

const starterPrompts = [
  {
    label: "Find stays",
    prompt: "Find me a stay in Goa under Rs. 3000 for 2 guests",
  },
  {
    label: "Book hotel",
    prompt: "How do I book this hotel?",
  },
  {
    label: "Payment issue",
    prompt: "My payment is not working",
  },
  {
    label: "Cancel booking",
    prompt: "How can I cancel my booking?",
  },
  {
    label: "Family stay",
    prompt: "Which stay is best for family?",
  },
];

const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

const getSavedLauncherPosition = () => {
  try {
    const savedPosition = JSON.parse(
      localStorage.getItem("bookingAssistantPosition")
    );

    if (
      typeof savedPosition?.x === "number" &&
      typeof savedPosition?.y === "number"
    ) {
      return {
        x: Math.min(Math.max(savedPosition.x, 12), window.innerWidth - 210),
        y: Math.min(Math.max(savedPosition.y, 12), window.innerHeight - 78),
      };
    }
  } catch {
    localStorage.removeItem("bookingAssistantPosition");
  }

  return {
    x: 20,
    y: window.innerHeight - 96,
  };
};

function BookingHelpAssistant() {
  const launcherPositionRef = useRef(getSavedLauncherPosition());
  const dragStateRef = useRef({
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [launcherPosition, setLauncherPosition] = useState(
    launcherPositionRef.current
  );
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      text: "Hi, I am your StayNext booking assistant. I can find stays, explain booking/payment steps, and help create a support ticket if you get stuck.",
    },
  ]);
  const [properties, setProperties] = useState([]);
  const [canCreateTicket, setCanCreateTicket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    bookingId: "",
    subject: "Booking help needed",
    message: "",
  });
  const [ticketStatus, setTicketStatus] = useState("");
  const userInfo = getUserInfo();

  useEffect(() => {
    if (!ticketOpen || !userInfo) {
      return;
    }

    const loadBookings = async () => {
      try {
        const data = await getMyBookings(1, 20);
        setBookings(data.items || []);
      } catch {
        setBookings([]);
      }
    };

    loadBookings();
  }, [ticketOpen, userInfo]);

  useEffect(() => {
    const handleResize = () => {
      setLauncherPosition((current) => ({
        x: Math.min(Math.max(current.x, 12), window.innerWidth - 210),
        y: Math.min(Math.max(current.y, 12), window.innerHeight - 78),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const moveLauncher = (clientX, clientY) => {
    const drag = dragStateRef.current;
    const nextX = clientX - drag.offsetX;
    const nextY = clientY - drag.offsetY;

    if (
      Math.abs(clientX - drag.startX) > 4 ||
      Math.abs(clientY - drag.startY) > 4
    ) {
      drag.moved = true;
    }

    const nextPosition = {
      x: Math.min(Math.max(nextX, 12), window.innerWidth - 210),
      y: Math.min(Math.max(nextY, 12), window.innerHeight - 78),
    };

    launcherPositionRef.current = nextPosition;
    setLauncherPosition(nextPosition);
  };

  const stopDragging = () => {
    dragStateRef.current.dragging = false;
    localStorage.setItem(
      "bookingAssistantPosition",
      JSON.stringify(launcherPositionRef.current)
    );
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current.dragging) {
      return;
    }

    moveLauncher(event.clientX, event.clientY);
  };

  const handlePointerUp = () => {
    stopDragging();
  };

  const handleLauncherPointerDown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    dragStateRef.current = {
      dragging: true,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleLauncherClick = () => {
    if (dragStateRef.current.moved) {
      dragStateRef.current.moved = false;
      return;
    }

    setIsOpen((current) => !current);
  };

  const submitQuestion = async (nextMessage = message) => {
    const cleanMessage = nextMessage.trim();

    if (!cleanMessage) {
      setConversation((current) => [
        ...current,
        { role: "assistant", text: "Please type your question first." },
      ]);
      return;
    }

    try {
      setIsOpen(true);
      setLoading(true);
      setTicketStatus("");
      setMessage("");
      setConversation((current) => [
        ...current,
        { role: "user", text: cleanMessage },
      ]);
      const data = await askAssistant(cleanMessage);
      setConversation((current) => [
        ...current,
        { role: "assistant", text: data.reply },
      ]);
      setProperties(data.properties || []);
      setCanCreateTicket(Boolean(data.canCreateTicket));
      setTicketForm((current) => ({
        ...current,
        message: cleanMessage,
      }));
    } catch (error) {
      setConversation((current) => [
        ...current,
        {
          role: "assistant",
          text:
            error.response?.data?.message ||
            "Assistant is not available right now. Please try again.",
        },
      ]);
      setProperties([]);
      setCanCreateTicket(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitQuestion();
  };

  const usePrompt = (prompt) => {
    setMessage(prompt);
    submitQuestion(prompt);
  };

  const handleTicketSubmit = async (event) => {
    event.preventDefault();
    setTicketStatus("");

    if (!userInfo) {
      setTicketStatus("Please login as a guest to create a support ticket.");
      return;
    }

    if (!ticketForm.bookingId || !ticketForm.subject || !ticketForm.message) {
      setTicketStatus("Please select a booking and describe your issue.");
      return;
    }

    try {
      await createTicket(ticketForm);
      setTicketStatus("Support ticket created. Admin can now review your issue.");
      setTicketOpen(false);
      setTicketForm({
        bookingId: "",
        subject: "Booking help needed",
        message: "",
      });
    } catch (error) {
      setTicketStatus(
        error.response?.data?.message || "Failed to create support ticket."
      );
    }
  };

  return (
    <>
      <button
        type="button"
        className={`booking-assistant-toggle ${isOpen ? "assistant-open" : ""}`}
        style={{
          left: `${launcherPosition.x}px`,
          top: `${launcherPosition.y}px`,
        }}
        onPointerDown={handleLauncherPointerDown}
        onClick={handleLauncherClick}
        aria-label="Open AI Booking Help Assistant"
      >
        <span className="assistant-toggle-orb">AI</span>
        <span>
          <strong>Booking Help</strong>
          <small>Ask, search, solve</small>
        </span>
      </button>

      <aside className={`booking-assistant ${isOpen ? "open" : ""}`}>
        <div className="booking-assistant-header">
          <div>
            <span>StayNext AI Concierge</span>
            <h2>AI Booking Help Assistant</h2>
            <p>Live property search, booking guidance, and support handoff.</p>
          </div>
          <button type="button" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <div className="assistant-status-row">
          <span>Online</span>
          <span>Uses your StayNext data</span>
          <span>Ticket ready</span>
        </div>

        <section className="assistant-chat-window">
          {conversation.map((item, index) => (
            <div className={`chat-message ${item.role}`} key={`${item.role}-${index}`}>
              <span className="chat-avatar">
                {item.role === "assistant" ? "AI" : "You"}
              </span>
              <p>{item.text}</p>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <span className="chat-avatar">AI</span>
              <p className="typing-dots">
                <span />
                <span />
                <span />
              </p>
            </div>
          )}
        </section>

        <form className="booking-assistant-form" onSubmit={handleSubmit}>
          <textarea
            id="assistantQuestion"
            rows="2"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Find me a stay in Goa under Rs. 3000 for 2 guests"
          />
          <button type="submit" disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </form>

        <div className="assistant-starters">
          {starterPrompts.map((item) => (
            <button
              key={item.prompt}
              type="button"
              onClick={() => usePrompt(item.prompt)}
            >
              <strong>{item.label}</strong>
              <span>{item.prompt}</span>
            </button>
          ))}
        </div>

        <section className="assistant-action-card">
          <div>
            <strong>Need human help?</strong>
            <p>Create a ticket and send the issue to admin.</p>
          </div>
          {canCreateTicket && (
            <button
              type="button"
              className="ticket-helper-btn"
              onClick={() => setTicketOpen((current) => !current)}
            >
              {ticketOpen ? "Hide Ticket Form" : "Create Support Ticket"}
            </button>
          )}
          {ticketStatus && <p className="ticket-status">{ticketStatus}</p>}
        </section>

        {ticketOpen && (
          <form className="assistant-ticket-form" onSubmit={handleTicketSubmit}>
            <label htmlFor="bookingId">Select booking</label>
            <select
              id="bookingId"
              value={ticketForm.bookingId}
              onChange={(event) =>
                setTicketForm((current) => ({
                  ...current,
                  bookingId: event.target.value,
                }))
              }
            >
              <option value="">Choose your booking</option>
              {bookings.map((booking) => (
                <option key={booking._id} value={booking._id}>
                  {booking.property?.title || "Property"} - Rs.{" "}
                  {booking.totalPrice}
                </option>
              ))}
            </select>

            <label htmlFor="ticketSubject">Subject</label>
            <input
              id="ticketSubject"
              type="text"
              value={ticketForm.subject}
              onChange={(event) =>
                setTicketForm((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
            />

            <label htmlFor="ticketMessage">Issue</label>
            <textarea
              id="ticketMessage"
              rows="3"
              value={ticketForm.message}
              onChange={(event) =>
                setTicketForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
            />

            <button type="submit">Send Ticket To Admin</button>
          </form>
        )}

        {properties.length > 0 && (
          <div className="assistant-property-list">
            <div className="assistant-section-title">
              <span>Matched stays</span>
              <strong>{properties.length} result(s)</strong>
            </div>
            {properties.map((property) => (
              <article className="assistant-property-card" key={property._id}>
                <img
                  src={
                    property.images?.length
                      ? property.images[0]
                      : "https://via.placeholder.com/160x120?text=Stay"
                  }
                  alt={property.title}
                />
                <div>
                  <h3>{property.title}</h3>
                  <p>{property.location}</p>
                  <div className="assistant-property-meta">
                    <strong>Rs. {property.pricePerNight} / night</strong>
                    <span>{property.maxGuests} guest(s)</span>
                  </div>
                  <Link to={`/property/${property._id}`}>View Details</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}

export default BookingHelpAssistant;
