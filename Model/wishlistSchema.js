import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);
