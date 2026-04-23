const getStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getBookingStatus = (booking) =>
  booking.bookingStatus || booking.status || "pending";

const getDerivedStayStatus = (booking, now = new Date()) => {
  const bookingStatus = getBookingStatus(booking);

  if (bookingStatus === "cancelled") {
    return "cancelled";
  }

  if (booking.actualCheckOutTime) {
    return "checked-out";
  }

  const today = getStartOfDay(now);
  const checkInDay = getStartOfDay(booking.checkIn);
  const checkOutDay = getStartOfDay(booking.checkOut);

  if (booking.actualCheckInTime) {
    if (today >= checkOutDay) {
      return "ready-for-check-out";
    }

    return "checked-in";
  }

  if (bookingStatus !== "confirmed" || booking.paymentStatus !== "paid") {
    return booking.stayStatus || "upcoming";
  }

  if (today >= checkInDay) {
    return "ready-for-check-in";
  }

  return "upcoming";
};

const syncStayStatus = (booking, now = new Date()) => {
  const stayStatus = getDerivedStayStatus(booking, now);
  booking.stayStatus = stayStatus;
  return stayStatus;
};

module.exports = {
  getStartOfDay,
  getDerivedStayStatus,
  syncStayStatus,
};
