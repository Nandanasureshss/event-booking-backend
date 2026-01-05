import Hotel from "../Model/hotelSchema.js";

export const createHotel = async (req, res) => {
  try {
    const { hotelName, location, description, roomCategories } = req.body;

    const parsedRooms = JSON.parse(roomCategories);

    const uploadedPhotos = req.files?.map(file => file.filename);

    const newHotel = await Hotel.create({
      hotelName,
      location,
      description,
      roomCategories: parsedRooms,
      mediaFiles: uploadedPhotos
    });

    res.status(201).json({
      success: true,
      message: "Hotel Created Successfully",
      data: newHotel
    });

  } catch (err) {
    console.log(err);
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
