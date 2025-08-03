# Stripe Modern Checkout Flow Setup Guide

## Overview

This guide implements the recommended modern Stripe flow: **Cart → Intent Creation → Payment → Order Confirmation**

## Files Created

1. `backend-stripe-endpoints.js` - All Stripe backend functions
2. `backend-stripe-routes.js` - Express routes setup
3. Frontend updates in `src/api.js` and `src/pages/checkout/Checkout.jsx`

## Backend Setup

### 1. Install Dependencies

```bash
npm install stripe @neylorxt/generate-unique-key
```

### 2. Environment Variables

Add to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Add Routes to Your Main App

In your main Express app file (e.g., `app.js` or `server.js`):

```javascript
import stripeRoutes from "./routes/stripe.js";

// Add this line to your app
app.use("/api/payment", stripeRoutes);
```

### 4. Database Schema Requirements

Make sure your Prisma schema includes these models:

```prisma
model Order {
  id        String   @id
  userId    String
  totalPrice Float
  status    String   // "pending", "confirmed", "cancelled", etc.
  subtotal  Float
  tax       Float
  currency  String
  additionalInfo String?

  // Billing fields
  billingFirstName String
  billingLastName  String
  billingEmail     String
  billingPhoneNumber String
  billingAddressLine1 String
  billingAddressLine2 String?
  billingCity      String
  billingState     String
  billingPostalCode String
  billingCountry   String

  // Shipping fields
  shippingFirstName String?
  shippingLastName  String?
  shippingEmail     String?
  shippingPhoneNumber String?
  shippingAddressLine1 String?
  shippingAddressLine2 String?
  shippingCity      String?
  shippingState     String?
  shippingPostalCode String?
  shippingCountry   String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user      Profile @relation(fields: [userId], references: [id])
  orderItems OrderItem[]
  payments  Payment[]
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float

  order     Order  @relation(fields: [orderId], references: [id])
}

model Payment {
  id            String @id
  orderId       String
  amount        Float
  currency      String
  paymentStatus String
  paymentMethod String
  gatewayResponse String

  order         Order  @relation(fields: [orderId], references: [id])
}
```

## Frontend Setup

### 1. Environment Variables

Add to your frontend `.env` file:

```env
VITE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 2. Install Frontend Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## API Endpoints

### Modern Flow Endpoints

#### 1. Create PaymentIntent Only

```
POST /api/payment/create-payment-intent-only
```

**Request Body:**

```json
{
  "userId": "123",
  "orderItems": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "checkoutData": {
    "billingFirstName": "John",
    "billingLastName": "Doe",
    "billingEmail": "john@example.com",
    "billingPhoneNumber": "+1234567890",
    "billingAddressLine1": "123 Main St",
    "billingCity": "Montreal",
    "billingState": "QC",
    "billingPostalCode": "H1A 1A1",
    "billingCountry": "Canada"
  },
  "currency": "CAD"
}
```

**Response:**

```json
{
  "message": "Payment intent created successfully",
  "paymentIntent": {
    "id": "pi_1234567890",
    "client_secret": "pi_1234567890_secret_abc123",
    "status": "requires_payment_method"
  },
  "amount": 65.98,
  "currency": "CAD"
}
```

#### 2. Create Order After Payment

```
POST /api/payment/create-order-after-payment
```

**Request Body:**

```json
{
  "userId": "123",
  "orderItems": [...],
  "checkoutData": {...},
  "paymentIntentId": "pi_1234567890"
}
```

**Response:**

```json
{
  "message": "Order created successfully after payment",
  "orderId": "DODODR2025-ABC12345",
  "order": {...},
  "payment": {...}
}
```

### Utility Endpoints

#### 3. Get Payment Intent Status

```
GET /api/payment/payment-intent/:paymentIntentId
```

#### 4. Refund Payment

```
POST /api/payment/refund
```

**Request Body:**

```json
{
  "paymentIntentId": "pi_1234567890",
  "amount": 3299, // Optional: amount in cents
  "reason": "requested_by_customer"
}
```

#### 5. Webhook Handler

```
POST /api/payment/webhook
```

Handles Stripe webhook events (payment_intent.succeeded, payment_intent.payment_failed, etc.)

## Stripe Dashboard Setup

### 1. Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
4. Copy the webhook secret to your `.env` file

### 2. Test Mode

- Use test keys for development
- Test card numbers:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - Expiry: Any future date
  - CVC: Any 3 digits

## Flow Diagram

```
1. User clicks "PAY NOW"
   ↓
2. Frontend calls /create-payment-intent-only
   ↓
3. Backend creates PaymentIntent (no order yet)
   ↓
4. Frontend shows Stripe payment form
   ↓
5. User enters card details and submits
   ↓
6. Stripe processes payment
   ↓
7. Frontend calls /create-order-after-payment
   ↓
8. Backend creates order and payment records
   ↓
9. User redirected to success page
```

## Error Handling

### Common Errors

- **400**: Invalid request data
- **402**: Card declined
- **404**: User profile or payment intent not found
- **500**: Server error

### Frontend Error Handling

The frontend automatically handles:

- Payment intent creation errors
- Payment processing errors
- Order creation errors
- Network errors

## Security Considerations

1. **Always verify webhook signatures** (implemented in webhook handler)
2. **Use HTTPS in production**
3. **Validate all input data**
4. **Use environment variables for secrets**
5. **Implement proper authentication** (JWT tokens)
6. **Rate limiting** (recommended for production)

## Testing

### 1. Test Payment Intent Creation

```bash
curl -X POST http://localhost:8000/api/payment/create-payment-intent-only \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "123",
    "orderItems": [{"productId": "prod_1", "quantity": 1, "price": 29.99}],
    "checkoutData": {...}
  }'
```

### 2. Test Order Creation

```bash
curl -X POST http://localhost:8000/api/payment/create-order-after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "123",
    "orderItems": [...],
    "checkoutData": {...},
    "paymentIntentId": "pi_test_123"
  }'
```

## Production Checklist

- [ ] Use production Stripe keys
- [ ] Set up webhook endpoints
- [ ] Configure proper error logging
- [ ] Set up monitoring and alerts
- [ ] Test with real payment methods
- [ ] Implement proper security measures
- [ ] Set up backup and recovery procedures

## Support

For issues:

1. Check Stripe Dashboard for payment status
2. Review server logs for errors
3. Verify webhook delivery in Stripe Dashboard
4. Test with Stripe CLI for local development
