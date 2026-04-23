const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const { createNotification } = require("../services/notificationService");

const getBookingStatus = (booking) =>
  booking.bookingStatus || booking.status || "pending";

const getPaymentStatus = (booking) => booking.paymentStatus || "pending";

// Create manual payment record
const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized for this booking",
      });
    }

    if (getBookingStatus(booking) === "cancelled") {
      return res.status(400).json({
        message: "Cannot create payment for a cancelled booking",
      });
    }

    if (getPaymentStatus(booking) === "paid") {
      return res.status(400).json({
        message: "This booking is already paid",
      });
    }

    const existingPayment = await Payment.findOne({ booking: bookingId });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already created for this booking",
      });
    }

    const transactionId = `TXN${Date.now()}`;

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalPrice,
      paymentMethod: paymentMethod || "card",
      transactionId,
      status: "pending",
    });

    res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Mark payment as successful
const completePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized for this payment",
      });
    }

    if (payment.status === "successful") {
      return res.status(400).json({
        message: "Payment is already completed",
      });
    }

    if (payment.status === "failed") {
      return res.status(400).json({
        message: "Failed payment cannot be marked successful",
      });
    }

    const booking = await Booking.findById(payment.booking);

    if (!booking) {
      return res.status(404).json({
        message: "Related booking not found",
      });
    }

    if (getBookingStatus(booking) === "cancelled") {
      return res.status(400).json({
        message: "Cannot complete payment for a cancelled booking",
      });
    }

    payment.status = "successful";
    await payment.save();

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    booking.status = "confirmed";
    booking.stayStatus = "upcoming";
    await booking.save();

    const property = await Property.findById(booking.property);

    await createNotification({
      userId: booking.user,
      type: "payment-success",
      title: "Payment successful",
      message: "Your payment was successful and the booking is now confirmed.",
      metadata: { bookingId: booking._id, paymentId: payment._id },
    });

    if (property?.host) {
      await createNotification({
        userId: property.host,
        type: "payment-success",
        title: "Booking confirmed",
        message: `A guest payment was completed for ${property.title}.`,
        metadata: { bookingId: booking._id, paymentId: payment._id },
      });
    }

    res.status(200).json({
      message: "Payment successful, booking confirmed",
      payment,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Mark payment as failed
const failPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized for this payment",
      });
    }

    if (payment.status === "failed") {
      return res.status(400).json({
        message: "Payment is already marked as failed",
      });
    }

    if (payment.status === "successful") {
      return res.status(400).json({
        message: "Successful payment cannot be marked failed",
      });
    }

    const booking = await Booking.findById(payment.booking);

    payment.status = "failed";
    await payment.save();

    if (booking) {
      booking.paymentStatus = "failed";
      booking.bookingStatus = "cancelled";
      booking.status = "cancelled";
      booking.stayStatus = "cancelled";
      await booking.save();

      const property = await Property.findById(booking.property);

      await createNotification({
        userId: booking.user,
        type: "payment-failed",
        title: "Payment failed",
        message: "Your payment failed and the booking was cancelled.",
        metadata: { bookingId: booking._id, paymentId: payment._id },
      });

      if (property?.host) {
        await createNotification({
          userId: property.host,
          type: "payment-failed",
          title: "Booking payment failed",
          message: `A payment attempt failed for ${property.title}.`,
          metadata: { bookingId: booking._id, paymentId: payment._id },
        });
      }
    }

    res.status(200).json({
      message: "Payment marked as failed",
      payment,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get my payments
const getMyPayments = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const query = { user: req.user._id };
    const total = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate({
        path: "booking",
        populate: {
          path: "property",
          select: "title location pricePerNight images",
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      items: payments,
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

// Admin gets every payment
const getAllPayments = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const total = await Payment.countDocuments();

    const payments = await Payment.find()
      .populate("user", "name email role")
      .populate({
        path: "booking",
        populate: {
          path: "property",
          select: "title location host",
          populate: {
            path: "host",
            select: "name email",
          },
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      items: payments,
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

module.exports = {
  createPayment,
  completePayment,
  failPayment,
  getMyPayments,
  getAllPayments,
};
