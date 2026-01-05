// models/cartModel.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userEmail: String,
    ticket: Object,
    hotels: Array,
    totalAmount: Number,
    paymentStatus: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
