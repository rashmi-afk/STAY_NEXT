const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    stayStatus: {
      type: String,
      enum: [
        "upcoming",
        "ready-for-check-in",
        "checked-in",
        "ready-for-check-out",
        "checked-out",
        "cancelled",
      ],
      default: "upcoming",
    },
    actualCheckInTime: {
      type: Date,
      default: null,
    },
    actualCheckOutTime: {
      type: Date,
      default: null,
    },
    checkInReminderSentAt: {
      type: Date,
      default: null,
    },
    checkOutReminderSentAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.bookingStatus = ret.bookingStatus || ret.status || "pending";
        ret.paymentStatus = ret.paymentStatus || "pending";
        ret.stayStatus = ret.stayStatus || "upcoming";
        ret.status = ret.bookingStatus;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        ret.bookingStatus = ret.bookingStatus || ret.status || "pending";
        ret.paymentStatus = ret.paymentStatus || "pending";
        ret.stayStatus = ret.stayStatus || "upcoming";
        ret.status = ret.bookingStatus;
        return ret;
      },
    },
  }
);

bookingSchema.pre("validate", function syncBookingStatus() {
  if (
    this.status &&
    (!this.bookingStatus || (this.isModified("status") && !this.isModified("bookingStatus")))
  ) {
    this.bookingStatus = this.status;
  }

  if (!this.bookingStatus) {
    this.bookingStatus = "pending";
  }

  if (!this.paymentStatus) {
    this.paymentStatus = "pending";
  }

  if (this.bookingStatus === "cancelled") {
    this.stayStatus = "cancelled";
  } else if (!this.stayStatus) {
    this.stayStatus = "upcoming";
  }

  this.status = this.bookingStatus;
});

module.exports = mongoose.model("Booking", bookingSchema);
