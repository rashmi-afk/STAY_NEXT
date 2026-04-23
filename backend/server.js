const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const securityHeaders = require("./middleware/securityHeaders");
const createRateLimit = require("./middleware/rateLimit");
const { startStayReminderService } = require("./services/stayReminderService");

dotenv.config();
connectDB();

const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors());
app.use(securityHeaders);
app.use(express.json());
app.use(createRateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Airbnb Backend Running...");
});

app.use("/api/upload", uploadRoutes);
app.use(
  "/api/auth",
  createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many authentication attempts. Please wait and try again.",
  }),
  require("./routes/authRoutes")
);
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startStayReminderService();
});
