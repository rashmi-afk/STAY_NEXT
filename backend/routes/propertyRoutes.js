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

const { protect, hostApprovedOnly } = require("../middleware/authMiddleware");

router.post("/", protect, hostApprovedOnly, addProperty);
router.get("/", getAllProperties);
router.get("/my-properties", protect, hostApprovedOnly, getMyProperties);
router.get("/:id", getPropertyById);
router.put("/:id", protect, hostApprovedOnly, updateProperty);
router.delete("/:id", protect, hostApprovedOnly, deleteProperty);

module.exports = router;
