// controller/cartController.js
import Cart from "../Model/cartSchema.js";

export const createCart = async (req, res) => {
  try {
    const cart = await Cart.create(req.body);
    res.status(201).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
