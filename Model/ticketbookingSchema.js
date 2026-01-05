import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
  },
  seatType: {
    type: String,
    required: true, // VIP / Premium / Normal
  },
  adults: {
    type: Number,
    default: 0
  },
  children: {
    type: Number,
    default: 0
  },
  pricePerPerson: {
    type: Number,
    // required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    // required: true
  },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
