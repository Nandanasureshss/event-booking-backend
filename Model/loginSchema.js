import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows null
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows null
    },

    emailOtp: String,
    phoneOtp: String,
    otpExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Login", userSchema);
