import jwt from "jsonwebtoken";
import Prisma from "./dbConnection.js";
import sendEmail from "./nodemailer.js";

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
  // send verification code
  const emailCode = emailVerificationCode();

  const emailSend = await sendEmail({
    to: email,
    subject: "Email Verification Code",
    template: "sendcode",
    context: { code: emailCode },
  });

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
}
// send email after order successfully paid
export async function sendOrderEmail(
  customerEmail,
  customerName,
  orderNumber,
  orderDate,
  items, // array of objects with { image, name, price, quantity }
  subtotal,
  tax,
  shipping,
  total
) {
  try {
    const productsHTML = items
      .map(
        (item) => `
      <div style="display: flex; align-items: center; padding: 20px 0; border-bottom: 1px solid #f1f3f4;">
        <img src="${item.image}" alt="${
          item.name
        }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 20px; border: 1px solid #e9ecef;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 16px; color: #495057; margin-bottom: 5px;">${
            item.name
          }</div>
          <div style="color: #6c757d; font-size: 14px;">Quantity: ${
            item.quantity
          }</div>
        </div>
        <div style="font-weight: 600; font-size: 16px; color: #28a745;">$${item.price.toFixed(
          2
        )}</div>
      </div>
    `
      )
      .join("");
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Order Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase, ${customerName}</p>
              </div>

              <!-- Order Info -->
              <div style="background-color: #f8f9fa; padding: 20px 30px; border-bottom: 1px solid #e9ecef;">
                  <h2 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">Order Details</h2>
                  <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
                      <div style="flex: 1; min-width: 150px;">
                          <div style="font-weight: 600; color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Number</div>
                          <div style="font-size: 16px; color: #495057;">#${orderNumber}</div>
                      </div>
                      <div style="flex: 1; min-width: 150px;">
                          <div style="font-weight: 600; color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Date</div>
                          <div style="font-size: 16px; color: #495057;">${new Date(
                            orderDate
                          ).toLocaleDateString()}</div>
                      </div>
                      <div style="flex: 1; min-width: 150px;">
                          <div style="font-weight: 600; color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Email</div>
                          <div style="font-size: 16px; color: #495057;">${customerEmail}</div>
                      </div>
                  </div>
              </div>

              <!-- Products Section -->
              <div style="padding: 30px;">
                  <h2 style="color: #495057; margin-bottom: 25px; font-size: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Items Ordered</h2>
                  
                  ${productsHTML}

                  <!-- Order Summary -->
                  <div style="margin-top: 30px; padding: 25px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                      <h3 style="margin: 0 0 20px 0; color: #495057; font-size: 18px;">Order Summary</h3>
                      
                      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #6c757d;">
                          <span>Subtotal:</span>
                          <span>$${subtotal.toFixed(2)}</span>
                      </div>
                      
                      ${
                        tax
                          ? `
                      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #6c757d;">
                          <span>Tax:</span>
                          <span>$${tax.toFixed(2)}</span>
                      </div>
                      `
                          : ""
                      }
                      
                      ${
                        shipping
                          ? `
                      <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: #6c757d;">
                          <span>Shipping:</span>
                          <span>$${shipping.toFixed(2)}</span>
                      </div>
                      `
                          : ""
                      }
                      
                      <div style="border-top: 2px solid #dee2e6; padding-top: 15px; display: flex; justify-content: space-between; font-weight: 600; font-size: 18px; color: #495057;">
                          <span>Total:</span>
                          <span style="color: #28a745;">$${total.toFixed(
                            2
                          )}</span>
                      </div>
                  </div>

                  <!-- Footer -->
                  <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e9ecef; text-align: center; color: #6c757d;">
                      <p style="margin: 0 0 15px 0;">We'll send you a shipping confirmation when your items are on the way!</p>
                      <p style="margin: 0; font-size: 14px;">Questions? Contact us at support@dripondrip.com</p>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
    const mailOptions = {
      from: "dripondrip@gmail.com",
      to: customerEmail,
      subject: `Order Confirmation #${orderNumber}`,
      html: htmlContent,
    };

    const emailSend = await transporter.sendMail(mailOptions);
    console.log("order email send successfully" + emailSend.id);
  } catch (error) {
    console.error("Error sending order email:", error);
    throw new Error("Failed to send order email");
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
