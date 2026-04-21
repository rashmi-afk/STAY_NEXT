const express = require("express");
const router = express.Router();

const {
  addProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
} = require("../controllers/propertyController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addProperty);
router.get("/", getAllProperties);
router.get("/my-properties", protect, getMyProperties);
router.get("/:id", getPropertyById);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;