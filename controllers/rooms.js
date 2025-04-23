const Room = require("../models/Room");
const RoomType = require("../models/RoomType");
const Booking = require("../models/Booking");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Public
exports.getRooms = asyncHandler(async (req, res, next) => {
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
});

// @desc    Get single room
// @route   GET /api/v1/rooms/:id
// @access  Public
exports.getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id)
    .populate("roomTypeId")
    .populate("hotelId")
    .populate("bookingDetails");

  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc    Create new room
// @route   POST /api/v1/rooms
// @access  Private/Admin
exports.createRoom = asyncHandler(async (req, res, next) => {
  // Check if room type exists
  const roomType = await RoomType.findById(req.body.roomTypeId);
  if (!roomType) {
    return next(new ErrorResponse(`Room type not found with id of ${req.body.roomTypeId}`, 404));
  }

  const room = await Room.create(req.body);

  res.status(201).json({
    success: true,
    data: room,
  });
});

// @desc    Update room
// @route   PUT /api/v1/rooms/:id
// @access  Private/Admin
exports.updateRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
  }

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc    Delete room
// @route   DELETE /api/v1/rooms/:id
// @access  Private/Admin
exports.deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
  }

  // Check if room has active bookings
  const activeBooking = await Booking.findOne({
    roomId: req.params.id,
    status: { $in: ["pending", "confirmed"] },
  });

  if (activeBooking) {
    return next(new ErrorResponse(`Cannot delete room with active bookings`, 400));
  }

  await room.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get rooms by hotel ID
// @route   GET /api/v1/rooms/hotel/:hotelId
// @access  Public
exports.getRoomsByHotelId = asyncHandler(async (req, res, next) => {
  const rooms = await Room.find({ hotelId: req.params.hotelId })
    .populate("roomTypeId");

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms,
  });
});

// @desc    Get rooms by room type
// @route   GET /api/v1/rooms/type/:roomTypeId
// @access  Public
exports.getRoomsByRoomType = asyncHandler(async (req, res, next) => {
  const rooms = await Room.find({ roomTypeId: req.params.roomTypeId })
    .populate("hotelId");

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms,
  });
});

// @desc    Update room status
// @route   PATCH /api/v1/rooms/:id/status
// @access  Private/Admin
exports.updateRoomStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse("Please provide a status", 400));
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
    return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc    Get available rooms
// @route   GET /api/v1/rooms/available
// @access  Public
exports.getAvailableRooms = asyncHandler(async (req, res, next) => {
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
});

// @desc    Bulk create rooms
// @route   POST /api/v1/rooms/bulk
// @access  Private/Admin
exports.bulkCreateRooms = asyncHandler(async (req, res, next) => {
  const { rooms } = req.body;

  if (!Array.isArray(rooms)) {
    return next(new ErrorResponse("Please provide an array of rooms", 400));
  }

  const createdRooms = await Room.insertMany(rooms);

  res.status(201).json({
    success: true,
    count: createdRooms.length,
    data: createdRooms,
  });
});

// @desc    Set room maintenance
// @route   POST /api/v1/rooms/:id/maintenance
// @access  Private/Admin
exports.setRoomMaintenance = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
  }

  // Check if room has active bookings
  const activeBooking = await Booking.findOne({
    roomId: req.params.id,
    status: { $in: ["pending", "confirmed"] },
  });

  if (activeBooking) {
    return next(new ErrorResponse(`Cannot set maintenance for room with active bookings`, 400));
  }

  room.status = "maintenance";
  room.lastMaintenance = Date.now();
  await room.save();

  res.status(200).json({
    success: true,
    data: room,
  });
});
