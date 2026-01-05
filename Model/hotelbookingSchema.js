import mongoose from "mongoose";

const hotelBookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  hotelName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    required: true, // Deluxe, Standard, Suite, etc.
  },
  checkIn: {
    type: String,
    required: true,
  },
  checkOut: {
    type: String,
    required: true,
  },
  guests: {
    type: Number,
    default: 1,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("HotelBooking", hotelBookingSchema);
