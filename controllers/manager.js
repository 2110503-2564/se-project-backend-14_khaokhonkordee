const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const RoomType = require('../models/RoomType');
const User = require('../models/User');

// @desc    Get all hotels managed by the manager
// @route   GET /api/v1/manager/hotels
// @access  Private (Manager only)
exports.getManagedHotels = async (req, res, next) => {
    try {
        const manager = await User.findById(req.user.id).populate('managedHotels');
        
        res.status(200).json({
            success: true,
            data: manager.managedHotels
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all bookings for a specific hotel
// @route   GET /api/v1/manager/hotels/:hotelId/bookings
// @access  Private (Manager only)
exports.getHotelBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ hotel: req.params.hotelId })
            .populate('user', 'name email')
            .populate('roomType');

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all room types for a specific hotel
// @route   GET /api/v1/manager/hotels/:hotelId/roomtypes
// @access  Private (Manager only)
exports.getHotelRoomTypes = async (req, res, next) => {
    try {
        const roomTypes = await RoomType.find({ hotelId: req.params.hotelId });

        res.status(200).json({
            success: true,
            data: roomTypes
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create a new room type for a hotel
// @route   POST /api/v1/manager/hotels/:hotelId/roomtypes
// @access  Private (Manager only)
exports.createRoomType = async (req, res, next) => {
    try {
        req.body.hotelId = req.params.hotelId;
        const roomType = await RoomType.create(req.body);

        res.status(201).json({
            success: true,
            data: roomType
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update a room type
// @route   PUT /api/v1/manager/roomtypes/:id
// @access  Private (Manager only)
exports.updateRoomType = async (req, res, next) => {
    try {
        const roomType = await RoomType.findById(req.params.id);

        if (!roomType) {
            return res.status(404).json({
                success: false,
                message: 'Room type not found'
            });
        }

        // Check if the room type belongs to a hotel that the manager can manage
        const manager = await User.findById(req.user.id);
        if (!manager.managedHotels.includes(roomType.hotelId.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to manage this room type.'
            });
        }

        const updatedRoomType = await RoomType.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: updatedRoomType
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete a room type
// @route   DELETE /api/v1/manager/roomtypes/:id
// @access  Private (Manager only)
exports.deleteRoomType = async (req, res, next) => {
    try {
        const roomType = await RoomType.findById(req.params.id);

        if (!roomType) {
            return res.status(404).json({
                success: false,
                message: 'Room type not found'
            });
        }

        // Check if the room type belongs to a hotel that the manager can manage
        const manager = await User.findById(req.user.id);
        if (!manager.managedHotels.includes(roomType.hotelId.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to manage this room type.'
            });
        }

        await roomType.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update a booking
// @route   PUT /api/v1/manager/bookings/:id
// @access  Private (Manager only)
exports.updateBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if the booking belongs to a hotel that the manager can manage
        const manager = await User.findById(req.user.id);
        if (!manager.managedHotels.includes(booking.hotel.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to manage this booking.'
            });
        }

        // Update the booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('user', 'name email').populate('roomType');

        res.status(200).json({
            success: true,
            data: updatedBooking
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update a hotel
// @route   PUT /api/v1/manager/hotels/:hotelId
// @access  Private (Manager only)
exports.updateHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        // Check if the manager has permission to manage this hotel
        const manager = await User.findById(req.user.id);
        if (!manager.managedHotels.includes(hotel._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to manage this hotel.'
            });
        }

        // Update the hotel
        const updatedHotel = await Hotel.findByIdAndUpdate(
            req.params.hotelId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: updatedHotel
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete a booking
// @route   DELETE /api/v1/manager/bookings/:id
// @access  Private (Manager only)
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if the booking belongs to a hotel that the manager can manage
        const manager = await User.findById(req.user.id);
        if (!manager.managedHotels.includes(booking.hotel.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to manage this booking.'
            });
        }

        // Delete the booking
        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}; 

