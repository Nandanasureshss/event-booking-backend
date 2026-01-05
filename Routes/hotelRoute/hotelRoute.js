import express from "express";
import upload from "../../Middleware/upload.js";
import { createHotel, getAllHotels, getSingleHotel } from "../../controller/hotelController.js";

const router = express.Router();

router.post("/add-hotel", upload.array("mediaFiles"), createHotel);
router.get("/all-hotels", getAllHotels);
router.get("/:id", getSingleHotel);

export default router;
