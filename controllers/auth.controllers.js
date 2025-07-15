import Prisma from "../utils/dbConnection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  verifyToken,
  sendEmailVerificationCode,
  userWithoutPassword,
  generateToken,
} from "../utils/utils.js";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // verify if email already exist
    const emailExist = await Prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (emailExist) {
      return res
        .status(409)
        .json({ message: "Email already exist, please try another one" });
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    const createUser = await Prisma.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });
    if (createUser) {
      //user Data without password
      const userInfos = userWithoutPassword(createUser);

      // create user profile
      await Prisma.profile.create({
        data: {
          userId: userInfos.userId,
        },
      });

      const token = generateToken(userInfos.userId);
      await Prisma.user.update({
        where: {
          id: userInfos.userId,
        },
        data: {
          token: token,
        },
      });

      // send email verification code
      await sendEmailVerificationCode(userInfos.userEmail, userInfos.userId);

      res.status(201).json({ message: "account created successfully", token });
    } else {
      throw new Error("Error when creating user");
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error when creating user " + err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userCredentials = await Prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userCredentials) {
      const correctPassword = await bcrypt.compare(
        password,
        userCredentials.password
      );
      if (correctPassword) {
        if (userCredentials.isActive === true) {
          // jwt pay load
          const payload = userWithoutPassword(userCredentials);
          // generate token
          const token = generateToken(payload.userId);
          return res
            .status(200)
            .json({ message: "user connected successfully.", token });
        } else {
          return res.status(451).json({
            message:
              "Your account is desactived, please contact our support at (+418-564-42312)",
          });
        }
      } else {
        return res.status(401).json({ message: "email or password incorrect" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "user doesnot exist, please create an account" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error when connecting user ${err.message}` });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    // update user token to null
    await Prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        token: null,
      },
    });
    res.status(200).json({ message: "user logout" });
  } catch (err) {
    res
      .status(500)
      .json({ error: `error when deconnecting the user ${err.message}` });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const emailVerification = await Prisma.emailVerification.findFirst({
      where: {
        userId: userId,
        code: code,
      },
    });

    if (emailVerification) {
      const now = new Date();
      if (now < new Date(emailVerification.expiredAt)) {
        await Prisma.user.update({
          where: { id: userId },
          data: { isVerified: true },
        });
        return res.status(200).json({ message: "Email verified successfully" });
      } else {
        return res.status(400).json({ message: "Verification code expired" });
      }
    } else {
      return res.status(404).json({ message: "Invalid verification code" });
    }
  } catch (err) {
    res.status(500).json({ message: `Error verifying email ${err.message}` });
  }
};

// ask for email verification code
export const requestEmailVerification = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await Prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // send email verification code
    await sendEmailVerificationCode(user.email, userId);

    return res.status(200).json({ message: "Verification email sent" });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error requesting email verification ${err.message}` });
  }
};

// refresh token
export const refreshToken = async (req, res) => {
  try {
    const token = req.token;
    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const newToken = generateToken(decoded.userId);
    res.status(200).json({ token: newToken });
  } catch (err) {
    res.status(500).json({ message: `Error refreshing token ${err.message}` });
  }
};
