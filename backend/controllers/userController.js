const mongoose = require("mongoose");
const User = require("../models/User");
const { createNotification } = require("../services/notificationService");
const bcrypt = require("bcryptjs");

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const search = req.query.search?.trim();
    const hostStatus = req.query.hostStatus?.trim();

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (hostStatus) {
      query.hostApprovalStatus = hostStatus;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      items: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHostApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { hostApprovalStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!["approved", "rejected", "pending"].includes(hostApprovalStatus)) {
      return res.status(400).json({ message: "Invalid host approval status" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "host") {
      return res.status(400).json({ message: "Only host accounts can be approved" });
    }

    user.hostApprovalStatus = hostApprovalStatus;
    await user.save();

    if (hostApprovalStatus === "approved") {
      await createNotification({
        userId: user._id,
        type: "host-approved",
        title: "Host access approved",
        message: "Your host account has been approved. You can now add properties.",
      });
    }

    if (hostApprovalStatus === "rejected") {
      await createNotification({
        userId: user._id,
        type: "host-rejected",
        title: "Host access rejected",
        message: "Your host request was reviewed and is not approved yet.",
      });
    }

    res.status(200).json({
      message: "Host approval updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostApprovalStatus: user.hostApprovalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      avatarUrl,
      currentPassword,
      newPassword,
      notificationPreferences,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedEmail = email?.trim().toLowerCase();

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      user.email = normalizedEmail;
    }

    if (name?.trim()) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = String(phone || "").trim();
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = String(avatarUrl || "").trim();
    }

    if (notificationPreferences && typeof notificationPreferences === "object") {
      user.notificationPreferences = {
        ...user.notificationPreferences?.toObject?.(),
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }

      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const passwordMatches = await bcrypt.compare(currentPassword, user.password);

      if (!passwordMatches) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        hostApprovalStatus: user.hostApprovalStatus,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateHostApproval,
  getMyProfile,
  updateMyProfile,
};
