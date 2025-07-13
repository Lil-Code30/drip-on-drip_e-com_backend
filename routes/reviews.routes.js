import express from "express";
import {
  getReviewsByProduct,
  addProductReview,
  editProductReview,
  deleteProductReview,
} from "../controllers/review.controllers.js";

const reviewsRoute = express.Router();

reviewsRoute.get("/:id", getReviewsByProduct);
reviewsRoute.post("/:id", addProductReview);
reviewsRoute.put("/:reviewId", editProductReview);
reviewsRoute.delete("/:reviewId", deleteProductReview);
export default reviewsRoute;
