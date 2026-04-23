const Booking = require("../models/Booking");
const { createNotification } = require("./notificationService");
const { getStartOfDay, syncStayStatus } = require("./bookingStayService");

let isRunning = false;
let reminderInterval = null;

const processStayReminders = async () => {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    const today = getStartOfDay(new Date());
    const bookings = await Booking.find({
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      stayStatus: { $nin: ["checked-out", "cancelled"] },
    }).populate("property", "title");

    for (const booking of bookings) {
      const nextStayStatus = syncStayStatus(booking, today);
      let hasChanges = false;

      if (
        nextStayStatus === "ready-for-check-in" &&
        !booking.actualCheckInTime &&
        !booking.checkInReminderSentAt
      ) {
        await createNotification({
          userId: booking.user,
          type: "check-in-reminder",
          title: "Punch in reminder",
          message: `Your stay for ${booking.property?.title || "this property"} starts today. Please punch in after arrival.`,
          metadata: { bookingId: booking._id, propertyId: booking.property?._id },
        });
        booking.checkInReminderSentAt = new Date();
        hasChanges = true;
      }

      if (
        nextStayStatus === "ready-for-check-out" &&
        booking.actualCheckInTime &&
        !booking.actualCheckOutTime &&
        !booking.checkOutReminderSentAt
      ) {
        await createNotification({
          userId: booking.user,
          type: "check-out-reminder",
          title: "Punch out reminder",
          message: `Your stay for ${booking.property?.title || "this property"} ends today. Please punch out before leaving.`,
          metadata: { bookingId: booking._id, propertyId: booking.property?._id },
        });
        booking.checkOutReminderSentAt = new Date();
        hasChanges = true;
      }

      if (booking.isModified("stayStatus")) {
        hasChanges = true;
      }

      if (hasChanges) {
        await booking.save();
      }
    }
  } catch (error) {
    console.error("processStayReminders error:", error);
  } finally {
    isRunning = false;
  }
};

const startStayReminderService = () => {
  if (reminderInterval) {
    return reminderInterval;
  }

  void processStayReminders();
  reminderInterval = setInterval(() => {
    void processStayReminders();
  }, 60 * 1000);

  return reminderInterval;
};

module.exports = {
  processStayReminders,
  startStayReminderService,
};
