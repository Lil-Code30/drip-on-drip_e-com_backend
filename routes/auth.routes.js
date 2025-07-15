import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  requestEmailVerification,
  refreshToken,
} from "../controllers/auth.controllers.js";

import { authMiddleware } from "../middlewares/auth.middlewares.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", authMiddleware, logoutUser);
authRouter.post("/verify-email", verifyEmail);
authRouter.get(
  "/request-email-verification-code",
  authMiddleware,
  requestEmailVerification
);
authRouter.get("/refresh-token", refreshToken);
export default authRouter;
