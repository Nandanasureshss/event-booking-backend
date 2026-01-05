import mongoose from "mongoose";

const roomCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },      // Deluxe, Standard, Suite
  price: { type: Number, required: true },
  roomsAvailable: { type: Number, required: true }
});

const hotelSchema = new mongoose.Schema(
  {
    hotelName: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    roomCategories: [roomCategorySchema],
    mediaFiles: [String],   // Hotel images
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);
