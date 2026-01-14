import Hotel from "../Model/hotelSchema.js";

import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

export const createHotel = async (req, res) => {
  try {
    const { hotelName, location, description, roomCategories } = req.body;

    const parsedRooms = JSON.parse(roomCategories);

    const mediaFiles = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "hotels" },
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

    const newHotel = await Hotel.create({
      hotelName,
      location,
      description,
      roomCategories: parsedRooms,
      mediaFiles // ✅ CLOUDINARY URLs
    });

    res.status(201).json({
      success: true,
      message: "Hotel Created Successfully",
      data: newHotel
    });

  } catch (err) {
    console.error("HOTEL CREATE ERROR ❌", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSingleHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
