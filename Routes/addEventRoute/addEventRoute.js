import express from "express";
import upload from "../../Middleware/upload.js";
import {
  createEvent,
  getSingleEvent,
  getAllEvents,
  getPopularEvents
} from "../../controller/addEventController.js";

const router = express.Router();

router.post(
  "/add-event",
  upload.fields([
    { name: "mediaFiles", maxCount: 10 },
    { name: "ticketPdf", maxCount: 1 } // ✅ FIXED
  ]),
  createEvent
);

router.get("/all-events", getAllEvents);
router.get("/:id", getSingleEvent);
router.get("/popular", getPopularEvents);

export default router;
