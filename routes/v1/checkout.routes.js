import express from "express";
import { createPaymentIntent } from "../../controllers/v1/checkout.controllers.js";
import { authMiddleware } from "../../middlewares/auth.middlewares.js";

const checkoutRoute = express.Router();

checkoutRoute.post(
  "/create-payment-intent",
  authMiddleware,
  createPaymentIntent
);

export default checkoutRoute;
