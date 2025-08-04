import Stripe from "stripe";
import Prisma from "../utils/dbConnection.js";
import { generateAlphaKey } from "@neylorxt/generate-unique-key";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const {
      userId,
      orderItems,
      checkoutData,
      additionalInfo = "",
      currency = "CAD",
    } = req.body;

    // caluculate total amount
    let subTotal = 0;
    orderItems.forEach((item) => {
      subTotal += item.price * item.quantity;
    });

    // Calculate taxes + total amount
    let GST = (5 / 100) * subTotal;
    let QST = (9.975 / 100) * subTotal;
    let totalAmount = subTotal + GST + QST;
    totalAmount = parseFloat(totalAmount.toFixed(2));

    // Create a unique order ID
    const date = new Date();
    const orderId = `DODODR${date.getFullYear()}-${generateAlphaKey(
      8,
      "-",
      4
    )}`;

    // Get user profile
    const id = parseInt(userId);
    const userProfile = await Prisma.profile.findFirst({
      where: { userId: id },
    });
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: (totalAmount * 100).toFixed(0), // Stripe expects the amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: userId,
        itemCount: orderItems.length,
        orderId: orderId,
      },
      description: `Payment for ${orderItems.length} items`,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    if (!paymentIntent) {
      return res.status(500).json({ error: "Failed to create payment intent" });
    }

    // Create the order in the database
    const createOrder = await Prisma.order.create({
      data: {
        id: orderId,
        userId: userProfile.id,
        totalPrice: totalAmount,
        status: "pending",
        subtotal: parseFloat(subTotal.toFixed(2)),
        tax: parseFloat((GST + QST).toFixed(2)),
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
        shippingFirstName:
          checkoutData.shippingFirstName || checkoutData.billingFirstName,
        shippingLastName:
          checkoutData.shippingLastName || checkoutData.billingLastName,
        shippingAddressLine1:
          checkoutData.shippingAddressLine1 || checkoutData.billingAddressLine1,
        shippingAddressLine2:
          checkoutData.shippingAddressLine2 || checkoutData.billingAddressLine2,
        shippingCity: checkoutData.shippingCity || checkoutData.billingCity,
        shippingState: checkoutData.shippingState || checkoutData.billingState,
        shippingPostalCode:
          checkoutData.shippingPostalCode || checkoutData.billingPostalCode,
        shippingCountry:
          checkoutData.shippingCountry || checkoutData.billingCountry,
        shippingPhoneNumber:
          checkoutData.shippingPhoneNumber || checkoutData.billingPhoneNumber,
        shippingEmail: checkoutData.shippingEmail || checkoutData.billingEmail,
      },
    });

    if (!createOrder) {
      // If order creation fails, we should cancel the payment intent
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw new Error("CreateOrderError");
    }

    // Create order items in the database
    const orderItemsData = orderItems.map((item) => {
      return {
        orderId,
        productId: item.productId,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
      };
    });
    const createOrderItems = await Prisma.orderItem.createMany({
      data: orderItemsData,
    });

    if (!createOrderItems) {
      // If order items creation fails, cleanup
      await Prisma.order.delete({ where: { id: orderId } });
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw new Error("CreateOrderItemsError");
    }

    // Create payment record in the database
    const createPayment = await Prisma.payment.create({
      data: {
        id: paymentIntent.id,
        orderId: orderId,
        amount: totalAmount,
        currency,
        paymentStatus: paymentIntent.status, // Stripe status is incomplete initially
        paymentMethod: paymentIntent.payment_method_types[0] || "card",
        gatewayResponse: JSON.stringify(paymentIntent),
        transactionId: null, // Will be updated when payment succeeds
      },
    });

    if (!createPayment) {
      // If payment record creation fails, cleanup
      await Prisma.orderItem.deleteMany({ where: { orderId } });
      await Prisma.order.delete({ where: { id: orderId } });
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw new Error("CreatePaymentError");
    }

    // Respond with client secret, orderId, and order details
    res.status(200).json({
      message: "Payment intent and order created successfully",
      clientSecret: paymentIntent.client_secret,
      orderId: orderId,
      order: createOrder,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    // Handle specific errors
    if (error.message === "CreatePaymentError") {
      return res.status(500).json({
        error: "Error creating payment record in the database",
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

    // Handle Stripe errors
    if (error.type === "StripeInvalidRequestError") {
      console.error("Stripe API error:", error);
      return res.status(400).json({
        error: "Invalid request to Stripe: " + error.message,
      });
    }
    if (error.type === "StripeCardError") {
      console.error("Stripe API error:", error);
      return res.status(402).json({
        error: "Card declined: " + error.message,
      });
    }
    if (error.type === "StripeAPIError") {
      console.error("Stripe API error:", error);
      return res.status(500).json({
        error: "Stripe API error: " + error.message,
      });
    }

    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      error: "Error creating payment intent: " + error.message,
    });
  }
};

//  Webhook handler for Stripe events
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment succeeded:", paymentIntent.id);

      try {
        // Update order status to "confirmed"
        const orderId = paymentIntent.metadata.orderId;
        if (orderId) {
          await Prisma.order.update({
            where: { id: orderId },
            data: {
              status: "Paid",
            },
          });

          // Update payment record
          await Prisma.payment.update({
            where: { id: paymentIntent.id },
            data: {
              paymentStatus: "succeeded",
              transactionId: paymentIntent.latest_charge || paymentIntent.id,
              gatewayResponse: JSON.stringify(paymentIntent),
              processedAt: new Date(),
            },
          });

          console.log(`Order ${orderId} confirmed after successful payment`);

          // Add any additional success logic here:
          // - Send confirmation email
          // - Update inventory
          // - Trigger fulfillment process
          // - Send notifications
        }
      } catch (error) {
        console.error("Error updating order after payment success:", error);
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("Payment failed:", failedPayment.id);

      try {
        // Update order status to "failed" or "cancelled"
        const orderId = failedPayment.metadata.orderId;
        if (orderId) {
          await Prisma.order.update({
            where: { id: orderId },
            data: {
              status: "failed",
            },
          });

          // Update payment record
          await Prisma.payment.update({
            where: { id: failedPayment.id },
            data: {
              paymentStatus: "failed",
              gatewayResponse: JSON.stringify(failedPayment),
            },
          });

          console.log(
            `Order ${orderId} marked as failed after payment failure`
          );
        }
      } catch (error) {
        console.error("Error updating order after payment failure:", error);
      }
      break;

    case "payment_intent.canceled":
      const canceledPayment = event.data.object;
      console.log("Payment canceled:", canceledPayment.id);

      try {
        const orderId = canceledPayment.metadata.orderId;
        if (orderId) {
          await Prisma.order.update({
            where: { id: orderId },
            data: {
              status: "cancelled",
              updatedAt: new Date(),
            },
          });

          await Prisma.payment.update({
            where: { id: canceledPayment.id },
            data: {
              paymentStatus: "canceled",
              gatewayResponse: JSON.stringify(canceledPayment),
              updatedAt: new Date(),
            },
          });

          console.log(`Order ${orderId} canceled`);
        }
      } catch (error) {
        console.error(
          "Error updating order after payment cancellation:",
          error
        );
      }
      break;

    case "charge.succeeded":
      const charge = event.data.object;
      console.log("Charge succeeded:", charge.id);
      break;

    case "charge.failed":
      const failedCharge = event.data.object;
      console.log("Charge failed:", failedCharge.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
