const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getHostBookings,
  getAllBookings,
  punchInBooking,
  punchOutBooking,
} = require("../controllers/bookingController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Create booking
router.post("/", protect, createBooking);

// Guest routes
router.get("/my-bookings", protect, getMyBookings);

// Host routes
router.get("/host-bookings", protect, getHostBookings);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllBookings);
router.put("/:id/punch-in", protect, punchInBooking);
router.put("/:id/punch-out", protect, punchOutBooking);

// IMPORTANT: keep this AFTER fixed routes
router.get("/:id", protect, getBookingById);

// Cancel booking
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;
