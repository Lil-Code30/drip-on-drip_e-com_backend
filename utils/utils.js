import jwt from "jsonwebtoken";
export function generateSKU(product) {
  // Example: First 3 letters of name + category + random 4 digits
  const namePart = product.name.substring(0, 3).toUpperCase();
  const categoryPart = product.category.substring(0, 3).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${namePart}-${categoryPart}-${randomPart}`;
}

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

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_WORD);
  } catch (error) {
    throw new Error("Invalid token");
  }
}
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

export function getTokenFromHeaders(headers) {
  const authHeader = headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Bearer token required");
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}
