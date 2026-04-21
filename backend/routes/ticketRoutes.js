const express = require("express");
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
  getTicketById,
} = require("../controllers/ticketController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createTicket);
router.get("/my-tickets", protect, getMyTickets);
router.get("/all", protect, adminOnly, getAllTickets);
router.get("/:id", protect, getTicketById);
router.put("/:id", protect, adminOnly, updateTicket);

module.exports = router;