import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  requestEmailVerification,
  refreshToken,
  changerUserPassword,
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
authRouter.put("/change-password", authMiddleware, changerUserPassword);
export default authRouter;
