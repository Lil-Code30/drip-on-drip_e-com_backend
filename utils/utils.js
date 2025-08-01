import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Prisma from "./dbConnection.js";

// Generate a SKU for a product
// Example: "ABC-1234-5678"
export function generateSKU(product) {
  // Example: First 3 letters of name + category + random 4 digits
  const namePart = product.name.substring(0, 3).toUpperCase();
  const categoryPart = product.category.substring(0, 3).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${namePart}-${categoryPart}-${randomPart}`;
}

// Generate a random email verification code
export function emailVerificationCode() {
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += Math.floor(Math.random() * 10);
  }

  return result;
}

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET_WORD, {
    expiresIn: "1h",
  });
}
export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET_WORD, {
    expiresIn: "30d",
  });
}

// Verify the token
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_WORD);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Check if token is expired
export function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true; // Token is invalid or does not have an expiration
    }
    return Date.now() >= decoded.exp * 1000; // Convert exp to milliseconds
  } catch (error) {
    return true; // If there's an error decoding, consider it expired
  }
}

// Get token from headers
export function getTokenFromHeaders(headers) {
  const authHeader = headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Bearer token required");
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

// send email function
export async function sendEmailVerificationCode(email, id) {
  try {
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

  // send verification code
  const emailCode = emailVerificationCode();

  const mailOptions = {
    from: "dripondrip@gmail.com",
    to: email,
    subject: "Email Verification Code",
    text: `This is your email verification code: ${emailCode}`,
    html: `<p> This is your email verification code: <strong>${emailCode}</strong></p>`,
  };

  const emailSend = await transporter.sendMail(mailOptions);
  if (emailSend) {
    const now = new Date();
    const createdAt = now.toISOString();
    const expiredAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    await Prisma.emailVerification.create({
      data: {
        userId: id,
        email: email,
        code: emailCode,
        createdAt,
        expiredAt,
      },
    });
  }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
    
  }
}

// user without password
export function userWithoutPassword(user) {
  return {
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
  };
}

export function getDefinedQueryData(req) {
  /*
        "firstName": "loko",
        "lastName": "Ismael",
        "bio": null,
        "gender": null,
        "avatarUrl": null,
        "addressLine1": null,
        "addressLine2": null,
        "city": null,
        "state": null,
        "postalCode": null,
        "country": null,
        "phoneNumber": null,
        "dateOfBirth": null,
  */
  const {
    firstName,
    lastName,
    bio,
    gender,
    avatarUrl,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phoneNumber,
  } = req;

  const updateData = {};

  // Only add fields that are provided
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (bio !== undefined) updateData.bio = bio;
}
