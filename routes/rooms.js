const express = require('express');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHotelId,
  getRoomsByRoomType,
  updateRoomStatus,
  getAvailableRooms,
  bulkCreateRooms,
  setRoomMaintenance
} = require('../controllers/rooms');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getRooms)
  .post(protect, authorize('admin'), createRoom);

router.route('/:id')
  .get(getRoom)
  .put(protect, authorize('admin'), updateRoom)
  .delete(protect, authorize('admin'), deleteRoom);

router.route('/hotel/:hotelId')
  .get(getRoomsByHotelId);

router.route('/type/:roomTypeId')
  .get(getRoomsByRoomType);

router.route('/:id/status')
  .patch(protect, authorize('admin'), updateRoomStatus);

router.route('/bulk')
  .post(protect, authorize('admin'), bulkCreateRooms);

router.route('/available')
  .get(getAvailableRooms);

router.route('/:id/maintenance')
  .post(protect, authorize('admin'), setRoomMaintenance);

module.exports = router;
