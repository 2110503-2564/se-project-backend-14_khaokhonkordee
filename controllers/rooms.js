const Room = require("../models/Room");
const RoomType = require("../models/RoomType");
const Booking = require("../models/Booking");

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    query = Room.find(reqQuery).populate("roomTypeId").populate("hotelId");

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("roomNumber");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Room.countDocuments(reqQuery);

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const rooms = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      pagination,
      data: rooms,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single room
// @route   GET /api/v1/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("roomTypeId")
      .populate("hotelId")
      .populate("bookingDetails");

    if (!room) {
      const error = new Error(`Room not found with id of ${req.params.id}`);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new room
// @route   POST /api/v1/rooms
// @access  Private/Admin
exports.createRoom = async (req, res, next) => {
  try {
    // Check if room type exists
    const roomType = await RoomType.findById(req.body.roomTypeId);
    if (!roomType) {
      const error = new Error(`Room type not found with id of ${req.body.roomTypeId}`);
      error.statusCode = 404;
      return next(error);
    }

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update room
// @route   PUT /api/v1/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      const error = new Error(`Room not found with id of ${req.params.id}`);
      error.statusCode = 404;
      return next(error);
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete room
// @route   DELETE /api/v1/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      const error = new Error(`Room not found with id of ${req.params.id}`);
      error.statusCode = 404;
      return next(error);
    }

    // Check if room has active bookings
    const activeBooking = await Booking.findOne({
      roomId: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBooking) {
      const error = new Error(`Cannot delete room with active bookings`);
      error.statusCode = 400;
      return next(error);
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get rooms by hotel ID
// @route   GET /api/v1/rooms/hotel/:hotelId
// @access  Public
exports.getRoomsByHotelId = async (req, res, next) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId })
      .populate("roomTypeId");

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get rooms by room type
// @route   GET /api/v1/rooms/type/:roomTypeId
// @access  Public
exports.getRoomsByRoomType = async (req, res, next) => {
  try {
    const rooms = await Room.find({ roomTypeId: req.params.roomTypeId })
      .populate("hotelId");

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update room status
// @route   PATCH /api/v1/rooms/:id/status
// @access  Private/Admin
exports.updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      const error = new Error("Please provide a status");
      error.statusCode = 400;
      return next(error);
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!room) {
      const error = new Error(`Room not found with id of ${req.params.id}`);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available rooms
// @route   GET /api/v1/rooms/available
// @access  Public
exports.getAvailableRooms = async (req, res, next) => {
  try {
    const { startDate, endDate, hotelId, roomTypeId } = req.query;

    // Basic query for available rooms
    let query = {
      status: "available",
    };

    if (hotelId) query.hotelId = hotelId;
    if (roomTypeId) query.roomTypeId = roomTypeId;

    // If dates are provided, check booking conflicts
    if (startDate && endDate) {
      const bookedRoomIds = await Booking.distinct("roomId", {
        $or: [
          {
            checkIn: { $lte: new Date(endDate) },
            checkOut: { $gte: new Date(startDate) },
          },
        ],
        status: { $in: ["pending", "confirmed"] },
      });

      query._id = { $nin: bookedRoomIds };
    }

    const rooms = await Room.find(query)
      .populate("roomTypeId")
      .populate("hotelId");

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk create rooms
// @route   POST /api/v1/rooms/bulk
// @access  Private/Admin
exports.bulkCreateRooms = async (req, res, next) => {
  try {
    const { rooms } = req.body;

    if (!Array.isArray(rooms)) {
      const error = new Error("Please provide an array of rooms");
      error.statusCode = 400;
      return next(error);
    }

    const createdRooms = await Room.insertMany(rooms);

    res.status(201).json({
      success: true,
      count: createdRooms.length,
      data: createdRooms,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set room maintenance
// @route   POST /api/v1/rooms/:id/maintenance
// @access  Private/Admin
exports.setRoomMaintenance = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      const error = new Error(`Room not found with id of ${req.params.id}`);
      error.statusCode = 404;
      return next(error);
    }

    // Check if room has active bookings
    const activeBooking = await Booking.findOne({
      roomId: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBooking) {
      const error = new Error(`Cannot set maintenance for room with active bookings`);
      error.statusCode = 400;
      return next(error);
    }

    room.status = "maintenance";
    room.lastMaintenance = Date.now();
    await room.save();

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};
