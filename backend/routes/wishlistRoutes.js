const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addToWishlist);
router.post("/:propertyId", protect, addToWishlist);
router.get("/", protect, getMyWishlist);
router.get("/my-wishlist", protect, getMyWishlist);
router.delete("/:propertyId", protect, removeFromWishlist);

module.exports = router;
