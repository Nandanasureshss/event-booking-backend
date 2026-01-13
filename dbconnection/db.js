import mongoose from "mongoose";
import dotenv from "dotenv";
console.log("ENV KEYS:", Object.keys(process.env));
console.log("MONGO_URL VALUE:", process.env.MONGO_URL);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
const mongoURL = process.env.MONGO_URL;

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch((err) => {
  console.log("MongoDB connection error:", err);
});
