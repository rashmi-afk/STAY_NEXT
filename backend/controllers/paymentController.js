const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

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

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        message: "Cannot create payment for a cancelled booking",
      });
    }

    if (booking.paymentStatus === "paid") {
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

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        message: "Cannot complete payment for a cancelled booking",
      });
    }

    payment.status = "successful";
    await payment.save();

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    await booking.save();

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
      await booking.save();
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
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: "booking",
        populate: {
          path: "property",
          select: "title location pricePerNight images",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
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
};
