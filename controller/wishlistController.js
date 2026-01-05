import Wishlist from "../Model/wishlistSchema.js";

export const toggleWishlist = async (req, res) => {
  const { userEmail, eventId } = req.body;

  try {
    const existing = await Wishlist.findOne({ userEmail, eventId });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      return res.json({ success: true, wishlisted: false });
    }

    await Wishlist.create({ userEmail, eventId });
    res.json({ success: true, wishlisted: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const list = await Wishlist.find({
      userEmail: req.params.email,
    }).populate("eventId");

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
