import Event from "../Model/addEventSchema.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

export const createEvent = async (req, res) => {
  try {
    console.log("FILES RECEIVED 👉", req.files);

    const {
      eventName,
      location,
      date,
      time,
      eventCategory,
      isPopular,
      seatingCategories,
      ticketType
    } = req.body;

    // ✅ Parse seating categories
    let parsedCategories = JSON.parse(seatingCategories);

    parsedCategories = parsedCategories.map((cat) => ({
      name: cat.name,
      price: Number(cat.price),
      purchasePrice: Number(cat.purchasePrice),
      ticketsAvailable: Number(cat.tickets),
      ticketPdfPath: null
    }));

    // ✅ Upload images to Cloudinary
  const mediaFiles = [];

if (req.files?.mediaFiles) {
  for (const file of req.files.mediaFiles) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "events" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
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
      isPopular,
      seatingCategories: parsedCategories,
      ticketType,
      mediaFiles
    });

    await event.save();

    res.json({
      success: true,
      message: "Event added successfully"
    });

  } catch (err) {
    console.error("CREATE EVENT ERROR ❌", err);
    res.status(500).json({
      success: false,
      message: err.message
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
    const events = await Event.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: events
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ---------------- GET POPULAR EVENTS ---------------- */

export const getPopularEvents = async (req, res) => {
  try {
    const { location, date } = req.query;

    const filter = { isPopular: true };

    if (location) filter.location = location;
    if (date) filter.date = date;

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

