import express from "express";
import { createBooking, getBookingsByUser } from "../../controller/ticketbookingController.js";

const router = express.Router();

router.post("/create", createBooking);
router.get("/user/:userId", getBookingsByUser);

export default router;
