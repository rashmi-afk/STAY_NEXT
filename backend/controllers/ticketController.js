const Ticket = require("../models/Ticket");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const mongoose = require("mongoose");
const User = require("../models/User");
const { createNotification } = require("../services/notificationService");

// User raises a ticket
const createTicket = async (req, res) => {
  try {
    const { bookingId, subject, message } = req.body;

    if (!bookingId || !subject || !message) {
      return res.status(400).json({
        message: "Booking ID, subject and message are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID",
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

    const createdTicket = await Ticket.findById(ticket._id)
      .populate("booking", "checkIn checkOut totalPrice bookingStatus paymentStatus")
      .populate("property", "title location");

    const admins = await User.find({ role: "admin" }).select("_id");
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin._id,
          type: "ticket-created",
          title: "New support ticket",
          message: `A new support ticket was raised for ${booking.property.title}.`,
          metadata: { ticketId: ticket._id, bookingId: booking._id },
        })
      )
    );

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: createdTicket,
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
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const query = { user: req.user._id };
    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate("booking", "checkIn checkOut totalPrice bookingStatus paymentStatus")
      .populate("property", "title location")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      items: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin views all tickets
const getAllTickets = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const total = await Ticket.countDocuments();
    const tickets = await Ticket.find()
      .populate("user", "name email role")
      .populate("booking", "checkIn checkOut totalPrice bookingStatus paymentStatus")
      .populate("property", "title location")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      items: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
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

    await createNotification({
      userId: ticket.user,
      type: "ticket-updated",
      title: "Support ticket updated",
      message: `Your support ticket "${ticket.subject}" was updated to ${ticket.status}.`,
      metadata: { ticketId: ticket._id },
    });

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
