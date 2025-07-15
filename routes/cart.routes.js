import express from "express";
import {
  getUserCart,
  addProductInCart,
  updateItemQtyInCart,
  updateUserCart,
  deleteItemInCart,
  clearUserCart,
  deletetCart,
} from "../controllers/cart.controllers.js";

const cartRoute = express.Router();

cartRoute.get("/", getUserCart);
cartRoute.post("/", addProductInCart);
cartRoute.put("/", updateUserCart);
cartRoute.delete("/:cartId", deletetCart);
cartRoute.delete("/", clearUserCart);
cartRoute.put("/:itemId", updateItemQtyInCart);
cartRoute.delete("/:itemId", deleteItemInCart);

export default cartRoute;
