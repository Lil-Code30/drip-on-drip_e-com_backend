import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRouter from "./routes/product.routes.js";
import reviewsRoute from "./routes/reviews.routes.js";
import cartRoute from "./routes/cart.routes.js";
import authRouter from "./routes/auth.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/product/reviews", reviewsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
