const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Property = require("../models/Property");

const getBookingStatus = (booking) =>
  booking.bookingStatus || booking.status || "pending";

// Add review
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        message: "Booking ID, rating and comment are required",
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
        message: "Not authorized to review this booking",
      });
    }

    if (getBookingStatus(booking) !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be reviewed",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You already reviewed this booking",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      property: booking.property._id,
      booking: booking._id,
      rating,
      comment,
    });

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get reviews for one property
const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews
        : 0;

    res.status(200).json({
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete own review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this review",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
  deleteReview,
};
