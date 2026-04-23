const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }
};

const hostApprovedOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "host") {
    return res.status(403).json({
      message: "Access denied. Host only.",
    });
  }

  if (req.user.hostApprovalStatus !== "approved") {
    return res.status(403).json({
      message: "Your host account is awaiting admin approval.",
    });
  }

  next();
};

module.exports = { protect, adminOnly, hostApprovedOnly };
