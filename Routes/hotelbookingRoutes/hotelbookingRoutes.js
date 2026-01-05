import express from "express";
import {
  createHotelBooking,
  getHotelBookingsByUser
} from "../../controller/hotelbookingController.js";

const router = express.Router();

router.post("/create", createHotelBooking);
router.get("/user/:userId", getHotelBookingsByUser);

export default router;
