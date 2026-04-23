const test = require("node:test");
const assert = require("node:assert/strict");

const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");

test("booking schema syncs legacy and new status fields", async () => {
  const booking = new Booking({
    user: "507f1f77bcf86cd799439011",
    property: "507f1f77bcf86cd799439012",
    checkIn: new Date("2026-05-01"),
    checkOut: new Date("2026-05-03"),
    totalPrice: 5000,
    status: "confirmed",
  });

  await booking.validate();

  assert.equal(booking.bookingStatus, "confirmed");
  assert.equal(booking.paymentStatus, "pending");
  assert.equal(booking.stayStatus, "upcoming");
  assert.equal(booking.status, "confirmed");
});

test("booking schema marks cancelled bookings with cancelled stay status", async () => {
  const booking = new Booking({
    user: "507f1f77bcf86cd799439011",
    property: "507f1f77bcf86cd799439012",
    checkIn: new Date("2026-05-01"),
    checkOut: new Date("2026-05-03"),
    totalPrice: 5000,
    bookingStatus: "cancelled",
  });

  await booking.validate();

  assert.equal(booking.stayStatus, "cancelled");
});

test("notification model defaults unread state to false", () => {
  const notification = new Notification({
    user: "507f1f77bcf86cd799439011",
    type: "booking-created",
    title: "Booking created",
    message: "A booking was created.",
  });

  const error = notification.validateSync();

  assert.equal(error, undefined);
  assert.equal(notification.isRead, false);
});

test("user model exposes default notification preferences", () => {
  const user = new User({
    name: "Demo User",
    email: "demo@example.com",
    password: "hashed-password",
  });

  const error = user.validateSync();

  assert.equal(error, undefined);
  assert.equal(user.notificationPreferences.inApp, true);
  assert.equal(user.notificationPreferences.browser, false);
  assert.equal(user.notificationPreferences.email, false);
  assert.equal(user.notificationPreferences.sms, false);
});
