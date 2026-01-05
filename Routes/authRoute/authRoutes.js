import express from "express";
import {
  googleLogin,
  sendOtp,
  verifyOtp
} from "../../controller/authController.js";

const router = express.Router();

// router.post("/login", loginUser);
router.post("/google-login", googleLogin
);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
