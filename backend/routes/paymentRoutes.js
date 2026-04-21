const express = require("express");
const router = express.Router();

const {
  createPayment,
  completePayment,
  failPayment,
  getMyPayments,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPayment);
router.put("/:paymentId/success", protect, completePayment);
router.put("/:paymentId/fail", protect, failPayment);
router.get("/my-payments", protect, getMyPayments);

module.exports = router;
