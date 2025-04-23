const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.ObjectId,
    ref: "Hotel", // Assuming you have a 'Hotel' model
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    integer: true,
  },
  bedType: {
    type: String,
    enum: [
      "Single",
      "Double",
      "Queen",
      "King",
      "Twin",
      "Bunk Beds",
      "Sofa Bed",
    ],
    required: true,
  },
  size: {
    type: String,
    trim: true,
    maxLength: 50,
  },
  amenities: [
    {
      type: String,
      trim: true,
      maxLength: 100,
    },
  ],
  facilities: [
    {
      type: String,
      enum: [
        "Free Wi-Fi",
        "Swimming pool",
        "Free parking",
        "Front desk [24-hour]",
        "Restaurant",
        "Bar",
        "Massage",
        "Airport transfer",
        "Air conditioning",
        "Heating",
        "Private bathroom",
        "Television",
        "Mini-bar",
        "Coffee/tea maker",
        "Safe",
        "Balcony/terrace",
        "Non-smoking rooms available",
        "Soundproofing" /* Add more facilities */,
      ],
      trim: true,
    },
  ],
  images: [
    {
      type: String,
      trim: true,
    },
  ],
  basePrice: {
    type: Number,
    required: false,
    min: 0,
  },
  currency: {
    type: String,
    default: "THB",
    trim: true,
    maxLength: 10,
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 0,
    integer: true,
  },
  nonAvailableRooms: {
    type: Number,
    required: true,
    min: 0,
    integer: true,
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },
  // Timestamps for creation and updates
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a compound index to enforce uniqueness of 'name' within the same 'hotelId'
roomTypeSchema.index({ hotelId: 1, name: 1 }, { unique: true });

const RoomType = mongoose.model("RoomType", roomTypeSchema);

module.exports = RoomType;
