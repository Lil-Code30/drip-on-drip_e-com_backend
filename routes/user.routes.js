import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { getUserProfile } from "../controllers/user.controller.js";

const userRoute = express.Router();

userRoute.get("/profile", authMiddleware, getUserProfile);

export default userRoute;
