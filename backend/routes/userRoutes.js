const express = require("express");
const {
  getAllUsers,
  updateHostApproval,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id/host-approval", protect, adminOnly, updateHostApproval);

module.exports = router;
