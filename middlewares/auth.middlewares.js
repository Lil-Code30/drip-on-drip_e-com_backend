import Prisma from "../utils/dbConnection.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Bearer token required" });
    }

    const token = authHeader.substring(7);
    if (!token) {
      return res.status(401).json({ error: "Token is missing" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_WORD);
    if (!decode) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // verify the user infos
    const user = await Prisma.user.findUnique({
      where: {
        id: decode.userId,
      },
    });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "User is not active" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    };
    req.token = token;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(504).json({ message: "Token Expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Wrong Token" });
    }
    res.status(500).json({ message: "Wrong When verifying the token" });
  }
};
