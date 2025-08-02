import Stripe from "stripe";
import Prisma from "../utils/dbConnection.js";
import { generateAlphaKey } from "@neylorxt/generate-unique-key";

// Create a payment intent DODODR2025-[radom8 characters]
export const createOrderAndPayment = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const {
      userId,
      orderItems,
      checkoutData,
      additionalInfo = "",
      currency = "CAD",
    } = req.body;

    let subTotal = 0;
    //create a unique orderId
    const date = new Date();
    const orderId = `DODODR${date.getFullYear()}-${generateAlphaKey(
      8,
      "-",
      4
    )}`;

    // Calculate subtotal amount
    orderItems.forEach((item) => {
      subTotal += item.price * item.quantity;
    });
    const id = parseInt(userId);
    const profile = await Prisma.profile.findFirst({
      where: { userId: id },
    });

    // calculate taxes + total amount
    // Assuming GST is 5% and QST is 9.975% for Canada
    let GST = (5 / 100) * subTotal;
    let QST = (9.975 / 100) * subTotal;
    let tax = GST + QST;
    let totalAmount = subTotal + GST + QST;
    totalAmount = parseFloat(totalAmount.toFixed(2));
    //create order in database
    const createOrder = await Prisma.order.create({
      data: {
        id: orderId,
        userId: profile.id,
        totalPrice: totalAmount,
        status: "pending",
        subtotal: parseFloat(subTotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        currency,
        additionalInfo,
        billingFirstName: checkoutData.billingFirstName,
        billingLastName: checkoutData.billingLastName,
        billingAddressLine1: checkoutData.billingAddressLine1,
        billingAddressLine2: checkoutData.billingAddressLine2,
        billingCity: checkoutData.billingCity,
        billingState: checkoutData.billingState,
        billingPostalCode: checkoutData.billingPostalCode,
        billingCountry: checkoutData.billingCountry,
        billingPhoneNumber: checkoutData.billingPhoneNumber,
        billingEmail: checkoutData.billingEmail,
        shippingFirstName: checkoutData.shippingFirstName,
        shippingLastName: checkoutData.shippingLastName,
        shippingAddressLine1: checkoutData.shippingAddressLine1,
        shippingAddressLine2: checkoutData.shippingAddressLine2,
        shippingCity: checkoutData.shippingCity,
        shippingState: checkoutData.shippingState,
        shippingPostalCode: checkoutData.shippingPostalCode,
        shippingCountry: checkoutData.shippingCountry,
        shippingPhoneNumber: checkoutData.shippingPhoneNumber,
        shippingEmail: checkoutData.shippingEmail,
      },
    });
    if (!createOrder) {
      throw new Error("CreateOrderError");
    }

    console.log("Order created:", createOrder);

    // create orderItems in the database
    const orderItemsData = orderItems.map((item) => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const createOrderItems = await Prisma.orderItem.createMany({
      data: orderItemsData,
    });

    if (!createOrderItems) {
      throw new Error("CreateOrderItemsError");
    }

    console.log("Order items created:", createOrderItems);

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Stripe expects the amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId,
        userId: profile.id,
        customerEmail: checkoutData.billingEmail,
        customerPhone: checkoutData.billingPhoneNumber,
        itemCount: orderItems.length,
        customerName: `${checkoutData.billingFirstName} ${checkoutData.billingLastName}`,
        additionalInfo: additionalInfo || "",
      },
      description: `Payment for order ${orderId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // create payment in the database
    const createPayment = await Prisma.payment.create({
      data: {
        id: paymentIntent.id,
        orderId: orderId,
        amount: totalAmount,
        currency,
        paymentStatus: paymentIntent.status,
        paymentMethod: paymentIntent.payment_method_types[0],

        gatewayResponse: JSON.stringify(paymentIntent),
      },
    });

    if (!createPayment) {
      throw new Error("CreatePaymentError");
    }

    res.status(200).json({
      message: "Order and payment created successfully",
      orderId: orderId,
      paymentIntent: paymentIntent,
      createOrder,
      createPayment,
    });
  } catch (error) {
    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        error: "Invalid request to Stripe: " + error.message,
      });
    }
    if (error.type === "StripeCardError") {
      return res.status(402).json({
        error: "Card declined: " + error.message,
      });
    }

    if (error.type === "StripeAPIError") {
      return res.status(500).json({
        error: "Stripe API error: " + error.message,
      });
    }
    if (error.message === "CreatePaymentError") {
      return res.status(500).json({
        error: "Error creating payment in the database",
      });
    }
    if (error.message === "CreateOrderItemsError") {
      return res.status(500).json({
        error: "Error creating order items in the database",
      });
    }
    if (error.message === "CreateOrderError") {
      return res.status(500).json({
        error: "Error creating order in the database",
      });
    }
    console.error("Error creating order and payment:", error);
    return res.status(400).json({
      error: "Error when creating order and payment " + error.message,
    });
  }
};
