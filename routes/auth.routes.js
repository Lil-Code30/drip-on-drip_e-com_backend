import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controllers.js";

import { authMiddlewarer } from "../middlewares/auth.middlewares.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", authMiddlewarer, logoutUser);

export default authRouter;
