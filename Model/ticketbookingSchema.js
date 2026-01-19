import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  seatType: {
    type: String,
    required: true,
  },

  adults: {
    type: Number,
    default: 0,
  },

  children: {
    type: Number,
    default: 0,
  },

  pricePerTicket: {
    type: Number,
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  userEmail: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
