const express = require("express");
const router = express.Router();

const {
  createPayment,
  completePayment,
  failPayment,
  getMyPayments,
  getAllPayments,
} = require("../controllers/paymentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createPayment);
router.put("/:paymentId/success", protect, completePayment);
router.put("/:paymentId/fail", protect, failPayment);
router.get("/my-payments", protect, getMyPayments);
router.get("/all", protect, adminOnly, getAllPayments);

module.exports = router;
