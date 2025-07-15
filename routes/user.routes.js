import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

const userRoute = express.Router();

userRoute.get("/profile", authMiddleware, getUserProfile);
userRoute.put("/profile", authMiddleware, updateUserProfile);

export default userRoute;
