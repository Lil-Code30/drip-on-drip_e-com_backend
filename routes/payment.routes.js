import express from "express";
import { createOrderAndPayment } from "../controllers/payment.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const PaymentRoute = express.Router();

PaymentRoute.post(
  "/create-payment-intent",

  createOrderAndPayment
);

export default PaymentRoute;
