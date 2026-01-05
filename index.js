import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./Routes/authRoute/authRoutes.js";
import hotelBookingRoutes from "./Routes/hotelbookingRoutes/hotelbookingRoutes.js";
import ticketBookingRoutes from "./Routes/ticketbookingRoutes/ticketBookingRoutes.js";
import eventRoutes from "./Routes/addEventRoute/addEventRoute.js";
import hotelRoutes from "./Routes/hotelRoute/hotelRoute.js";
import cartRoutes from "./Routes/cartRoutes/cartRoutes.js";
import wishlistRoutes from "./Routes/wishlistRoute/wishlistRoutes.js";
import loginRoutes from "./Routes/loginRoutes/loginRoutes.js";
import "./dbconnection/db.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/hotelBooking", hotelBookingRoutes);
app.use("/api/ticketBooking", ticketBookingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/login", loginRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


