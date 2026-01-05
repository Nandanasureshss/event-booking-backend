import mongoose from "mongoose";

const seatingCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // VVIP, VIP, Gold, etc.
  price: { type: Number, required: true },
  ticketsAvailable: { type: Number, required: true }
});

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },

    eventCategory: {
      type: String,
      enum: [
        "Music",
        "Dance Show",
        "Stage Show",
        "Comedy Show",
        "DJ Night",
        "Theatre"
      ],
      required: true
    },

    isPopular: {
      type: Boolean,
      default: false
    },
ticketType: {
  type: String,
  enum: ["online", "pdf"],
  required: true
},
ticketPdf: {
  type: String // filename
},

    seatingCategories: [seatingCategorySchema],
    mediaFiles: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
