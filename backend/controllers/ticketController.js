const Ticket = require("../models/Ticket");
const Booking = require("../models/Booking");
const Property = require("../models/Property");

// User raises a ticket
const createTicket = async (req, res) => {
  try {
    const { bookingId, subject, message } = req.body;

    if (!bookingId || !subject || !message) {
      return res.status(400).json({
        message: "Booking ID, subject and message are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate("property");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to raise ticket for this booking",
      });
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      booking: booking._id,
      property: booking.property._id,
      subject,
      message,
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// User views own tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate("booking", "checkIn checkOut totalPrice bookingStatus paymentStatus")
      .populate("property", "title location")
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin views all tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email role")
      .populate("booking", "checkIn checkOut totalPrice bookingStatus paymentStatus")
      .populate("property", "title location")
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin updates ticket status and reply
const updateTicket = async (req, res) => {
  try {
    const { status, adminReply } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (status) {
      ticket.status = status;
    }

    if (adminReply !== undefined) {
      ticket.adminReply = adminReply;
    }

    const updatedTicket = await ticket.save();

    res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// User views single own ticket
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("booking", "checkIn checkOut totalPrice bookingStatus paymentStatus")
      .populate("property", "title location")
      .populate("user", "name email");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (
      ticket.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to view this ticket",
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
  getTicketById,
};