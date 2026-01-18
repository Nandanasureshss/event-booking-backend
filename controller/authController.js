import Login from "../Model/loginSchema.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

/* ---------------- GOOGLE CLIENT ---------------- */
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ---------------- NODEMAILER TRANSPORTER ---------------- */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // ✅ IMPORTANT for Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


/* ---------------- HELPERS ---------------- */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ---------------- SEND OTP ---------------- */
export const sendOtp = async (req, res) => {
  console.log("SEND OTP BODY:", req.body);

  try {
    const { method, email, phone } = req.body;
    const otp = generateOtp();

    if (
      !method ||
      (method === "email" && !email) ||
      (method === "phone" && !phone)
    ) {
      return res.status(400).json({ msg: "Invalid request" });
    }

    let user;

    if (method === "email") {
      user = await Login.findOne({ email });
      if (!user) user = new Login({ email });
    } else {
      user = await Login.findOne({ phone });
      if (!user) user = new Login({ phone });
    }

    user.emailOtp = null;
    user.phoneOtp = null;

    if (method === "email") {
      user.emailOtp = otp;


      // send OTP email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Login OTP",
        text: `Your OTP is ${otp}`,
      });
    } else {
      user.phoneOtp = otp;
      console.log("📱 Phone OTP:", otp); // mock SMS
    }

    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.json({ msg: `OTP sent via ${method}` });
  } catch (err) {
    console.error("SEND OTP ERROR ❌", err);
    res.status(500).json({ msg: "Email service failed" });
  }
};

/* ---------------- VERIFY OTP ---------------- */
export const verifyOtp = async (req, res) => {
  try {
    const { method, email, phone, otp } = req.body;

    if (!method || !otp) {
      return res.status(400).json({ msg: "Invalid request" });
    }

    const user =
      method === "email"
        ? await Login.findOne({ email })
        : await Login.findOne({ phone });

    if (!user || !user.otpExpiry) {
      return res.status(400).json({ msg: "Please resend OTP" });
    }

    if (Date.now() > new Date(user.otpExpiry).getTime()) {
      return res.status(400).json({ msg: "OTP expired. Please resend OTP." });
    }

    if (method === "email" && user.emailOtp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (method === "phone" && user.phoneOtp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    user.emailOtp = null;
    user.phoneOtp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

/* ---------------- GOOGLE LOGIN ---------------- */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await Login.findOne({ email });

    if (!user) {
      user = await Login.create({ email });
    }

    const jwtToken = generateToken(user._id);

    res.json({
      msg: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        email,
        name,
      },
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ msg: "Google login failed" });
  }
};
