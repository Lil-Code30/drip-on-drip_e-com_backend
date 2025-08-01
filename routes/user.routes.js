import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  changeUserAddress,
} from "../controllers/user.controller.js";

const userRoute = express.Router();

userRoute.get("/profile", authMiddleware, getUserProfile);
userRoute.put("/profile", authMiddleware, updateUserProfile);
userRoute.put("/change-password", authMiddleware, changeUserPassword);
userRoute.post("/add-address", authMiddleware, changeUserAddress);

export default userRoute;
