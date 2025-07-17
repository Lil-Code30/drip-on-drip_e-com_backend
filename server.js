import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRouter from "./routes/product.routes.js";
import reviewsRoute from "./routes/reviews.routes.js";
import cartRoute from "./routes/cart.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
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
app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/product/reviews", reviewsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/auth", authRouter);
app.use("/api/user", userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
