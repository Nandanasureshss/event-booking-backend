import express from "express";
import {
  toggleWishlist,
  getWishlist,
} from "../../controller/wishlistController.js";

const router = express.Router();

router.post("/toggle", toggleWishlist);
router.get("/:email", getWishlist);

export default router;
