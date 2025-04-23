const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, "Room number is required"],
    trim: true,
  },
  roomTypeId: {
    type: mongoose.Schema.ObjectId,
    ref: "RoomType",
    required: [true, "Room type is required"],
    index: true,
  },
  hotelId: {
    type: mongoose.Schema.ObjectId,
    ref: "Hotel",
    required: [true, "Hotel is required"],
    index: true,
  },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance", "reserved"],
    default: "available",
  },
  floor: {
    type: Number,
    required: [true, "Floor number is required"],
  },
  specialNotes: {
    type: String,
    maxLength: [500, "Special notes cannot be more than 500 characters"],
  },
  lastMaintenance: {
    type: Date,
  },
  currentBooking: {
    type: mongoose.Schema.ObjectId,
    ref: "Booking",
  },
  features: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create compound index for hotelId and roomNumber to ensure unique room numbers within a hotel
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

// Add virtual populate for current booking details
roomSchema.virtual("bookingDetails", {
  ref: "Booking",
  localField: "_id",
  foreignField: "roomId",
  justOne: true,
});

module.exports = mongoose.model("Room", roomSchema);
