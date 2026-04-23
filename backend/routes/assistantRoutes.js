const express = require("express");
const { askAssistant } = require("../controllers/assistantController");

const router = express.Router();

router.post("/ask", askAssistant);

module.exports = router;
