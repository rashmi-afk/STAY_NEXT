const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getHostBookings,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

// Create booking
router.post("/", protect, createBooking);

// Guest routes
router.get("/my-bookings", protect, getMyBookings);

// Host routes
router.get("/host-bookings", protect, getHostBookings);

// IMPORTANT: keep this AFTER fixed routes
router.get("/:id", protect, getBookingById);

// Cancel booking
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;