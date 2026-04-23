const Notification = require("../models/Notification");

const createNotification = async ({
  userId,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!userId || !type || !title || !message) {
    return null;
  }

  return Notification.create({
    user: userId,
    type,
    title,
    message,
    metadata,
  });
};

module.exports = { createNotification };
