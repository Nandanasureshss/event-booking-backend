import Login from "../Model/loginSchema.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";

/* ---------------- GOOGLE CLIENT ---------------- */
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ---------------- TWILIO CLIENT ---------------- */
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ---------------- SENDGRID CONFIG ---------------- */
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    if (
      !method ||
      (method === "email" && !email) ||
      (method === "phone" && !phone)
    ) {
      return res.status(400).json({ msg: "Invalid request" });
    }

    let user;

    if (method === "email") {
      const otp = generateOtp();

      user = await Login.findOne({ email });
      if (!user) user = new Login({ email });

      user.emailOtp = otp;
      user.phoneOtp = null;
      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await sgMail.send({
        to: email,
        from: process.env.EMAIL_USER,
        subject: "Your Login OTP",
        text: `Your OTP is ${otp}`,
      });

      await user.save();

      console.log("EMAIL OTP SAVED:", {
        email: user.email,
        otp: user.emailOtp,
        expiry: user.otpExpiry,
      });

      return res.json({ msg: "OTP sent via email" });
    }

    /* ---------------- PHONE OTP (TWILIO VERIFY) ---------------- */
    if (method === "phone") {
      user = await Login.findOne({ phone });
      if (!user) user = new Login({ phone });

      await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: phone,          // must be +91XXXXXXXXXX
          channel: "sms",
        });

      await user.save();

      return res.json({ msg: "OTP sent via phone" });
    }
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ msg: "OTP sending failed" });
  }
};

/* ---------------- VERIFY OTP ---------------- */
export const verifyOtp = async (req, res) => {
  try {
    const { method, email, phone, otp } = req.body;

    if (!method || !otp) {
      return res.status(400).json({ msg: "Invalid request" });
    }

    let user;

    /* ---------------- EMAIL OTP VERIFY ---------------- */
    if (method === "email") {
      user = await Login.findOne({ email });

      if (!user || !user.otpExpiry) {
        return res.status(400).json({ msg: "Please resend OTP" });
      }

      if (Date.now() > new Date(user.otpExpiry).getTime()) {
        return res.status(400).json({ msg: "OTP expired. Please resend OTP." });
      }

      if (user.emailOtp !== otp) {
        return res.status(400).json({ msg: "Invalid OTP" });
      }
    }

    /* ---------------- PHONE OTP VERIFY (TWILIO) ---------------- */
    if (method === "phone") {
      user = await Login.findOne({ phone });

      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: phone,
          code: otp,
        });

      if (verificationCheck.status !== "approved") {
        return res.status(400).json({ msg: "Invalid OTP" });
      }
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
    res.status(500).json({ msg: "OTP verification failed" });
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
    if (!user) user = await Login.create({ email });

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
