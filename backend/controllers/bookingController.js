const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const { createNotification } = require("../services/notificationService");
const { getStartOfDay, syncStayStatus } = require("../services/bookingStayService");

const getBookingStatus = (booking) =>
  booking.bookingStatus || booking.status || "pending";

const getPaymentStatus = (booking) => booking.paymentStatus || "pending";

const getStayStatus = (booking) => {
  if (booking.stayStatus) {
    return booking.stayStatus;
  }

  return syncStayStatus(booking);
};

// Create booking
const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "Please provide property, check-in and check-out dates",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Invalid check-in or check-out date",
      });
    }

    if (startDate < today) {
      return res.status(400).json({
        message: "Check-in date cannot be in the past",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date",
      });
    }

    const guestCount = Number(guests) || 1;

    if (guestCount < 1) {
      return res.status(400).json({
        message: "Guests must be at least 1",
      });
    }

    if (guestCount > property.maxGuests) {
      return res.status(400).json({
        message: `Maximum guests allowed is ${property.maxGuests}`,
      });
    }

    const overlappingBooking = await Booking.findOne({
      property: propertyId,
      $or: [{ bookingStatus: "confirmed" }, { status: "confirmed" }],
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: "Property is already booked for selected dates",
      });
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((endDate - startDate) / oneDay);
    const totalPrice = nights * property.pricePerNight;

    const booking = await Booking.create({
      user: req.user._id,
      property: propertyId,
      checkIn: startDate,
      checkOut: endDate,
      guests: guestCount,
      totalPrice,
      bookingStatus: "pending",
      paymentStatus: "pending",
      stayStatus: "upcoming",
    });

    await createNotification({
      userId: req.user._id,
      type: "booking-created",
      title: "Booking created",
      message: `Your booking request for ${property.title} has been created and is awaiting payment.`,
      metadata: { bookingId: booking._id, propertyId: property._id },
    });

    await createNotification({
      userId: property.host,
      type: "booking-created",
      title: "New booking request",
      message: `A guest created a booking request for ${property.title}.`,
      metadata: { bookingId: booking._id, propertyId: property._id },
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get my bookings
const getMyBookings = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const query = { user: req.user._id };
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("property", "title location pricePerNight images")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      items: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get single booking by ID
const getBookingById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("property", "title location pricePerNight images")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("getBookingById error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to cancel this booking",
      });
    }

    if (getBookingStatus(booking) === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    booking.bookingStatus = "cancelled";
    booking.status = "cancelled";
    booking.stayStatus = "cancelled";

    if (getPaymentStatus(booking) === "pending") {
      booking.paymentStatus = "failed";
    }

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("cancelBooking error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const punchInBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(req.params.id).populate(
      "property",
      "title host"
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this booking",
      });
    }

    if (getBookingStatus(booking) !== "confirmed" || getPaymentStatus(booking) !== "paid") {
      return res.status(400).json({
        message: "Only paid and confirmed bookings can be punched in",
      });
    }

    if (getStayStatus(booking) === "cancelled") {
      return res.status(400).json({
        message: "Cancelled bookings cannot be punched in",
      });
    }

    if (booking.actualCheckInTime) {
      return res.status(400).json({
        message: "Punch in has already been recorded",
      });
    }

    const today = getStartOfDay(new Date());
    const checkInDay = getStartOfDay(booking.checkIn);
    const checkOutDay = getStartOfDay(booking.checkOut);

    if (today < checkInDay) {
      return res.status(400).json({
        message: "Punch in is available from the check-in date",
      });
    }

    if (today >= checkOutDay) {
      return res.status(400).json({
        message: "Punch in is no longer available after the stay ends",
      });
    }

    booking.actualCheckInTime = new Date();
    booking.stayStatus = "checked-in";
    await booking.save();

    await createNotification({
      userId: booking.user,
      type: "stay-checked-in",
      title: "Punch in recorded",
      message: `Your stay for ${booking.property?.title || "this property"} is now checked in.`,
      metadata: { bookingId: booking._id, propertyId: booking.property?._id },
    });

    if (booking.property?.host) {
      await createNotification({
        userId: booking.property.host,
        type: "stay-checked-in",
        title: "Guest checked in",
        message: `A guest has punched in for ${booking.property.title}.`,
        metadata: { bookingId: booking._id, propertyId: booking.property._id },
      });
    }

    res.status(200).json({
      message: "Punch in recorded successfully",
      booking,
    });
  } catch (error) {
    console.error("punchInBooking error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const punchOutBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(req.params.id).populate(
      "property",
      "title host"
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this booking",
      });
    }

    if (!booking.actualCheckInTime) {
      return res.status(400).json({
        message: "You need to punch in before punching out",
      });
    }

    if (booking.actualCheckOutTime) {
      return res.status(400).json({
        message: "Punch out has already been recorded",
      });
    }

    const today = getStartOfDay(new Date());
    const checkOutDay = getStartOfDay(booking.checkOut);

    if (today < checkOutDay) {
      return res.status(400).json({
        message: "Punch out is available from the check-out date",
      });
    }

    booking.actualCheckOutTime = new Date();
    booking.stayStatus = "checked-out";
    await booking.save();

    await createNotification({
      userId: booking.user,
      type: "stay-checked-out",
      title: "Punch out recorded",
      message: `Your stay for ${booking.property?.title || "this property"} is now checked out.`,
      metadata: { bookingId: booking._id, propertyId: booking.property?._id },
    });

    if (booking.property?.host) {
      await createNotification({
        userId: booking.property.host,
        type: "stay-checked-out",
        title: "Guest checked out",
        message: `A guest has punched out for ${booking.property.title}.`,
        metadata: { bookingId: booking._id, propertyId: booking.property._id },
      });
    }

    res.status(200).json({
      message: "Punch out recorded successfully",
      booking,
    });
  } catch (error) {
    console.error("punchOutBooking error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get bookings for host properties
const getHostBookings = async (req, res) => {
  try {
    if (req.user.role !== "host") {
      return res.status(403).json({
        message: "Access denied. Host only.",
      });
    }

    const properties = await Property.find({ host: req.user._id }).select("_id");
    const propertyIds = properties.map((property) => property._id);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const query = {
      property: { $in: propertyIds },
    };
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("property", "title location images pricePerNight")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      items: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("getHostBookings error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin gets all bookings across the platform
const getAllBookings = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const total = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate("user", "name email role")
      .populate({
        path: "property",
        select: "title location images pricePerNight host",
        populate: {
          path: "host",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      items: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getHostBookings,
  getAllBookings,
  punchInBooking,
  punchOutBooking,
};
