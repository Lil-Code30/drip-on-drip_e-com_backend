import express from "express";
import {
  getUserCart,
  addProductInCart,
  updateItemQtyInCart,
  updateUserCart,
  deleteItemInCart,
  clearUserCart,
  deletetCart,
} from "../../controllers/v1/cart.controllers.js";

const cartRoute = express.Router();

cartRoute.get("/", getUserCart);
cartRoute.post("/", addProductInCart);
cartRoute.put("/", updateUserCart);
cartRoute.delete("/user-cart", deleteItemInCart);
cartRoute.delete("/:userId", clearUserCart);
// cartRoute.delete("/:cartId", deletetCart);
// cartRoute.put("/:itemId", updateItemQtyInCart);

export default cartRoute;
