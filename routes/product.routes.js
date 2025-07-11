import express from "express";
import {
  getAllProducts,
  getProductById,
  searchProducts,
} from "../controllers/product.controllers.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/search", searchProducts);
// productRouter.get("/category/:category", getProductsByCategory);
productRouter.get("/:id", getProductById);
// productRouter.post("/", addNewProduct);

export default productRouter;
