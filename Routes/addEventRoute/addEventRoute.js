import express from "express";
import upload from "../../Middleware/upload.js";
import { createEvent,getSingleEvent,getAllEvents, getPopularEvents } from "../../controller/addEventController.js";

const router = express.Router();

router.post(
  "/add-event",
 upload.fields([
  { name: "mediaFiles", maxCount: 10 },
  { name: "ticketPdf_0", maxCount: 1 },
  { name: "ticketPdf_1", maxCount: 1 },
  { name: "ticketPdf_2", maxCount: 1 },
  { name: "ticketPdf_3", maxCount: 1 },
  { name: "ticketPdf_4", maxCount: 1 }
]),
  createEvent
);
router.get("/popular", getPopularEvents);
router.get("/all-events", getAllEvents);
router.get("/:id", getSingleEvent);

export default router;
