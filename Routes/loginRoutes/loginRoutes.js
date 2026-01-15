import express from "express";
import {  googleLogin, login } from "../../controller/loginController.js";

const router = express.Router();

router.post("/login", login);
export default router;
