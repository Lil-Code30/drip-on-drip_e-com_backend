import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes v1
import productRouter from "./routes/v1/product.routes.js";
import reviewsRoute from "./routes/v1/reviews.routes.js";
import cartRoute from "./routes/v1/cart.routes.js";
import authRouter from "./routes/v1/auth.routes.js";
import userRoute from "./routes/v1/user.routes.js";
import checkoutRoute from "./routes/v1/checkout.routes.js";
import cookieParser from "cookie-parser";
import { handleStripeWebhook } from "./controllers/v1/checkout.controllers.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  "https://drip-on-drip-v1.vercel.app",
  "http://localhost:5173",
];
const corsOption = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // If you need to send cookies
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};
app.use(cors(corsOption));
//  Use cookie-parser middleware
app.use(cookieParser());
app.use("/webhook", express.raw({ type: "application/json" }));

app.post(
  "/webhook/stripe-webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

// --- VERSION 1 --- //
app.use("/api/v1/products", productRouter);
app.use("/api/v1/product/reviews", reviewsRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/checkout", checkoutRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
