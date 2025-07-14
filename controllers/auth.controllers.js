import Prisma from "../utils/dbConnection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { emailVerificationCode } from "../utils/utils.js";

// Configure nodemailer with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT) || 25,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // data verification here

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
      const userInfos = {
        userId: createUser.id,
        userEmail: createUser.email,
        userRole: createUser.role,
        isActive: createUser.isActive,
        isVerified: createUser.isVerified,
      };

      // create user profile
      await Prisma.profile.create({
        data: {
          userId: userInfos.userId,
        },
      });

      const token = jwt.sign(userInfos, process.env.JWT_SECRET_WORD, {
        expiresIn: "2h",
      });
      await Prisma.user.update({
        where: {
          id: userInfos.userId,
        },
        data: {
          token: token,
        },
      });

      // send verification code
      const emailCode = emailVerificationCode();

      const mailOptions = {
        from: "dripondrip@gmail.com",
        to: userInfos.userEmail,
        subject: "Email Verification Code",
        text: `This is your email verification code: ${emailCode}`,
        html: `<p> This is your email verification code: <strong>${emailCode}</strong></p>`,
      };

      const emailSend = await transporter.sendMail(mailOptions);

      if (emailSend) {
        const now = new Date();
        const createdAt = now.toISOString();
        const expiredAt = new Date(
          now.getTime() + 10 * 60 * 1000
        ).toISOString();
        createdAt +
          (await Prisma.emailVerification.create({
            data: {
              userId: userInfos.userId,
              email: userInfos.userEmail,
              code: emailCode,
              createdAt,
              expiredAt,
            },
          }));
      }

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
          //
          const payload = {
            userId: userCredentials.id,
            userEmail: userCredentials.email,
            userRole: userCredentials.role,
            isActive: userCredentials.isActive,
            isVerified: userCredentials.isVerified,
          };
          const token = jwt.sign(payload, process.env.JWT_SECRET_WORD, {
            expiresIn: "2h",
          });

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
    res.status(200).json({ message: "user logout" });
  } catch (err) {
    res
      .status(500)
      .json({ error: `error when deconnecting the user ${err.message}` });
  }
};
