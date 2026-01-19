import mongoose from "mongoose";

/* ===============================
   SEATING CATEGORY SCHEMA
================================ */
const seatingCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // VVIP, VIP, Gold, etc.
  },
  price: {
    type: Number,
    required: true
  },
  purchasePrice: {
    type: Number, // optional
    default: 0
  },
  ticketsAvailable: {
    type: Number,
    required: true
  },
  ticketPdfPath: {
    type: String, // Cloudinary PDF URL (per category if needed)
    default: null
  }
});

/* ===============================
   EVENT SCHEMA
================================ */
const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    date: {
      type: String,
      required: true
    },

    time: {
      type: String,
      required: true
    },

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

    // Event-level PDF (used when ticketType = pdf)
    ticketPdf: {
      type: String,
      default: null
    },

    seatingCategories: {
      type: [seatingCategorySchema],
      required: true
    },

    mediaFiles: [
      {
        type: String // Cloudinary image URLs
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
