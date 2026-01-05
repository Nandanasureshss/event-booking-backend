// routes/cartRoutes.js
import express from "express";
import { createCart } from "../../controller/cartController.js";

const router = express.Router();

router.post("/create", createCart);

export default router;
