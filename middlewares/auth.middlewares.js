import Prisma from "../utils/dbConnection.js";
import jwt from "jsonwebtoken";
import {
  getTokenFromHeaders,
  userWithoutPassword,
  isTokenExpired,
} from "../utils/utils.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromHeaders(req.headers);

    if (!token) {
      return res.status(401).json({ error: "Token is missing" });
    }

    // Verify the token
    // If token is invalid or expired, we need to logout the user
    // and return an error response

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

    req.user = userWithoutPassword(user);
    // Attach the token to the request object for further use
    req.token = token;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(504).json({ message: "Token Expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Wrong Token" });
    }
    res.status(500).json({ message: "Error When verifying the user token" });
  }
};
