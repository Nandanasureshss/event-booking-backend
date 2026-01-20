import Event from "../Model/addEventSchema.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import nodemailer from "nodemailer"
export const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      location,
      date,
      time,
      eventCategory,
      isPopular,
      ticketType,
      seatingCategories
    } = req.body;

    const isPopularBoolean = isPopular === "true" || isPopular === true;

    let parsedCategories = JSON.parse(seatingCategories || "[]");
    parsedCategories = parsedCategories.map(cat => ({
      name: cat.name,
      price: Number(cat.price),
      purchasePrice: Number(cat.purchasePrice),
      ticketsAvailable: Number(cat.tickets),
      ticketPdfPath: null
    }));

    const mediaFiles = [];
    let ticketPdf = null;

    if (ticketType === "pdf" && req.files?.ticketPdf?.length > 0) {
      const pdfFile = req.files.ticketPdf[0];

      const pdfResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "event_tickets" },
          (error, result) => (result ? resolve(result) : reject(error))
        );
        streamifier.createReadStream(pdfFile.buffer).pipe(stream);
      });

      ticketPdf = pdfResult.secure_url;
    }

    if (req.files?.mediaFiles) {
      for (const file of req.files.mediaFiles) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "events" },
            (error, result) => (result ? resolve(result) : reject(error))
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        mediaFiles.push(result.secure_url);
      }
    }

    const event = new Event({
      eventName,
      location,
      date,
      time,
      eventCategory,
      isPopular: isPopularBoolean,
      ticketType,
      ticketPdf,
      seatingCategories: parsedCategories,
      mediaFiles
    });

    await event.save();

    res.status(201).json({ success: true, message: "Event added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add event" });
  }
};

/* ================================
   BOOK TICKET CONTROLLER
================================ */

export const bookTicket = async (req, res) => {
  try {
    const { eventId, userEmail } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    /* ---------- EMAIL SETUP ---------- */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Event Ticket Confirmation",
      html: ""
    };

    /* ---------- ONLINE TICKET ---------- */
    if (event.ticketType === "online") {
      mailOptions.html = `
        <p>Dear Guest,</p>

        <p>Thank you for booking your ticket for <b>${event.eventName}</b>.</p>

        <p>
          This event uses an <b>online ticket system</b>.<br/>
          Please download the required application to access your ticket.
        </p>

        <p><b>XYZ Application</b></p>

        <p>
          Log in using your registered email address to view your ticket.
        </p>

        <p>Regards,<br/>Event Team</p>
      `;
    }

   /* ---------- PDF TICKET ---------- */
if (event.ticketType === "pdf") {
  mailOptions.subject = `Your Event Ticket – ${event.eventName}`;
  mailOptions.html = `
    <p>Dear Guest,</p>

    <p>Thank you for booking your ticket for <b>${event.eventName}</b>.</p>

    <p>
      Your ticket is attached to this email.
      Please carry a printed copy or show the PDF at the entry gate.
    </p>

    <p>Enjoy the event!</p>

    <p>Regards,<br/>Event Team</p>
  `;

  mailOptions.attachments = [
    {
      filename: "event-ticket.pdf",
      path: event.ticketPdf   // ✅ USE SAVED CLOUDINARY URL
    }
  ];
}


    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Ticket booked and email sent successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Ticket booking failed"
    });
  }
};

/* ---------------- GET SINGLE EVENT ---------------- */

export const getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ---------------- GET ALL EVENTS ---------------- */

export const getAllEvents = async (req, res) => {
  try {
    console.log("🔥 GET /all-events HIT");

    const events = await Event.find();
    console.log("📦 EVENTS FOUND:", events.length);

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error("❌ getAllEvents error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ---------------- GET POPULAR EVENTS ---------------- */
export const getPopularEvents = async (req, res) => {
  try {
    const filter = { isPopular: true };

    if (req.query.location?.trim()) {
      filter.location = req.query.location.trim();
    }

    const events = await Event.find(filter)
      .limit(3);

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error("❌ getPopularEvents error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
