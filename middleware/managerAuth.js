const User = require("../models/User");

// Middleware to check if user is a manager and has permission to manage a specific hotel
exports.checkManagerHotelAccess = async (req, res, next) => {
  try {
    // Check if user is a manager
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only managers can perform this action.",
      });
    }

    // Get the hotel ID from the request
    const hotelId = req.params.hotelId;
    console.log(hotelId);
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID is required",
      });
    }

    // Check if the manager has access to this hotel
    const manager = await User.findById(req.user.id);
    if (!manager.managedHotels.includes(hotelId)) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission to manage this hotel.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
