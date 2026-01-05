import HotelBooking from "../Model/hotelbookingSchema.js";

// CREATE BOOKING
export const createHotelBooking = async (req, res) => {
  try {
    const booking = new HotelBooking(req.body);
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET BOOKINGS OF A USER
export const getHotelBookingsByUser = async (req, res) => {
  try {
    const bookings = await HotelBooking.find({ userId: req.params.userId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
