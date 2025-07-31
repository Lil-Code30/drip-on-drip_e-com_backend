import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword
} from "../controllers/user.controller.js";

const userRoute = express.Router();

userRoute.get("/profile", authMiddleware, getUserProfile);
userRoute.put("/profile", authMiddleware, updateUserProfile);
userRoute.put("change-password", authMiddleware, changeUserPassword);

export default userRoute;
