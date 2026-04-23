const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getDerivedStayStatus,
  syncStayStatus,
} = require("../services/bookingStayService");

const buildBooking = (overrides = {}) => ({
  bookingStatus: "confirmed",
  status: "confirmed",
  paymentStatus: "paid",
  stayStatus: "upcoming",
  checkIn: new Date("2026-05-10T00:00:00.000Z"),
  checkOut: new Date("2026-05-12T00:00:00.000Z"),
  actualCheckInTime: null,
  actualCheckOutTime: null,
  ...overrides,
});

test("stay service marks confirmed paid booking as ready for check in on check-in day", () => {
  const booking = buildBooking();
  const result = getDerivedStayStatus(booking, new Date("2026-05-10T08:30:00.000Z"));

  assert.equal(result, "ready-for-check-in");
});

test("stay service marks checked-in booking as ready for check out on checkout day", () => {
  const booking = buildBooking({
    actualCheckInTime: new Date("2026-05-10T09:00:00.000Z"),
  });
  const result = getDerivedStayStatus(booking, new Date("2026-05-12T09:30:00.000Z"));

  assert.equal(result, "ready-for-check-out");
});

test("syncStayStatus mutates booking object with derived status", () => {
  const booking = buildBooking({
    actualCheckInTime: new Date("2026-05-10T09:00:00.000Z"),
  });

  const status = syncStayStatus(booking, new Date("2026-05-11T10:00:00.000Z"));

  assert.equal(status, "checked-in");
  assert.equal(booking.stayStatus, "checked-in");
});
