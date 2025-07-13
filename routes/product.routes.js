import express from "express";
import {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getIsFeatureProduct,
  getlatestProducts,
} from "../controllers/product.controllers.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/search", searchProducts);
productRouter.get("/category/:category", getProductsByCategory);
productRouter.get("/featuredProducts", getIsFeatureProduct);
productRouter.get("/latestProducts", getlatestProducts);
productRouter.get("/:id", getProductById);

// productRouter.post("/", addNewProduct);

export default productRouter;
