const Booking = require("../models/Booking");
const Property = require("../models/Property");

// Create booking
const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "Please provide property, check-in and check-out dates",
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
      bookingStatus: "confirmed",
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
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get my bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("property", "title location pricePerNight images")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get single booking by ID
const getBookingById = async (req, res) => {
  try {
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
    res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
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

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    booking.bookingStatus = "cancelled";

    if (booking.paymentStatus === "pending") {
      booking.paymentStatus = "failed";
    }

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get bookings for host properties
const getHostBookings = async (req, res) => {
  try {
    const properties = await Property.find({ host: req.user._id }).select("_id");
    const propertyIds = properties.map((property) => property._id);

    const bookings = await Booking.find({
      property: { $in: propertyIds },
    })
      .populate("property", "title location images pricePerNight")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
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
};