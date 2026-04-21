const express = require("express");
const router = express.Router();

const {
  createReview,
  getPropertyReviews,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReview);
router.get("/property/:propertyId", getPropertyReviews);
router.delete("/:id", protect, deleteReview);

module.exports = router;