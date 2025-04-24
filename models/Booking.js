const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  checkinDate: {
    type: Date,
    require: true,
  },
  checkoutDate: {
    type: Date,
    require: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: "Hotel",
    required: true,
  },
  roomType: {
    type: mongoose.Schema.ObjectId,
    ref: "RoomType",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  roomId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  }
},{ versionKey: false });

module.exports = mongoose.model("Booking", BookingSchema);
