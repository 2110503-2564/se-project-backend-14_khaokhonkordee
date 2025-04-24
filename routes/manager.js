const express = require('express');
const {
    getManagedHotels,
    getHotelBookings,
    getHotelRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    updateBooking,
    deleteBooking,
    updateHotel
} = require('../controllers/manager');

const { protect, authorize } = require('../middleware/auth');
const { checkManagerHotelAccess } = require('../middleware/managerAuth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('manager'));

// Hotel management routes
router.get('/hotels', getManagedHotels);
router.put('/hotels/:hotelId', checkManagerHotelAccess, updateHotel);


// Booking management routes
router.get('/hotels/:hotelId/bookings', checkManagerHotelAccess, getHotelBookings);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);

// Room type management routes
router.get('/hotels/:hotelId/roomtypes', checkManagerHotelAccess, getHotelRoomTypes);
router.post('/hotels/:hotelId/roomtypes', checkManagerHotelAccess, createRoomType);
router.put('/roomtypes/:id', updateRoomType);
router.delete('/roomtypes/:id', deleteRoomType);

module.exports = router; 