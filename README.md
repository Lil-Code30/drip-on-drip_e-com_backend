# DripOnDrip E-commerce Backend

This is the backend for the DripOnDrip e-commerce platform. It is a Node.js application built with Express.js and Prisma. The API is live and hosted on Render, and the database is a PostgreSQL database hosted on Neon.

## Live API Link

The API is live at: `https://drip-on-drip-e-com-backend.onrender.com/api/v1`

You can test the products endpoint at: `https://drip-on-drip-e-com-backend.onrender.com/api/v1/products`

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- PostgreSQL

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Lil-Code30/drip-on-drip_e-com_backend.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables by creating a `.env` file in the root of the project. You will need to add the following variables. For local development, you can use a local PostgreSQL instance. For production, you can use a hosted PostgreSQL provider like Neon.
    ```
    DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING" # e.g., postgresql://USER:PASSWORD@HOST:PORT/DATABASE
    JWT_SECRET="YOUR_JWT_SECRET"
    REFRESH_TOKEN_SECRET="YOUR_REFRESH_TOKEN_SECRET"
    STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
    ```
4.  Run the database migrations:
    ```bash
    npx prisma migrate dev
    ```
5.  Seed the database:
    ```bash
    npx prisma db seed
    ```

### Running the application

```bash
npm start
```

To test the Stripe webhook, run the following command:

```bash
PORT=8000 # the port where your server is running
stripe listen --forward-to localhost:${PORT}/webhook/stripe-webhook
```

The application will be available at `http://localhost:${PORT}`.

## Available Scripts

- `npm start`: Starts the application.
- `npm run watch`: Starts the application in watch mode.
- `npm run maildev`: Starts MailDev for email testing.
- `npm run seed`: Seeds the database.

## API Endpoints v1

> All v1 endpoints are prefixed with `/api/v1`.

### Authentication

- `POST /api/v1/auth/register`: Register a new user.
- `POST /api/v1/auth/login`: Login a user.
- `POST /api/v1/auth/logout`: Logout a user.
- `POST /api/v1/auth/verify-email`: Verify a user's email.
- `GET /api/v1/auth/request-email-verification-code`: Request a new email verification code.
- `GET /api/v1/auth/refresh-token`: Refresh a user's access token.
- `PUT /api/v1/auth/change-password`: Change a user's password.

### Cart

- `GET /api/v1/cart`: Get the user's cart.
- `POST /api/v1/cart`: Add a product to the cart.
- `PUT /api/v1/cart`: Update the user's cart.
- `DELETE /api/v1/cart/user-cart`: Delete an item from the cart.
- `DELETE /api/v1/cart/:userId`: Clear the user's cart.

### Checkout

- `POST /api/v1/checkout/create-payment-intent`: Create a payment intent.

### Products

- `GET /api/v1/products`: Get all products.
- `GET /api/v1/products/search`: Search for products.
- `GET /api/v1/products/category/:category`: Get products by category.
- `GET /api/v1/products/featuredProducts`: Get featured products.
- `GET /api/v1/products/latestProducts`: Get the latest products.
- `GET /api/v1/products/:id`: Get a product by its ID.

### Reviews

- `GET /api/v1/product/reviews/:id`: Get all reviews for a product.
- `POST /api/v1/product/reviews/:id`: Add a review to a product.
- `PUT /api/v1/product/reviews/:reviewId`: Edit a product review.
- `DELETE /api/v1/product/reviews/:reviewId`: Delete a product review.

### User

- `GET /api/v1/user/profile`: Get the user's profile.
- `PUT /api/v1/user/profile`: Update the user's profile.
- `PUT /api/v1/user/change-password`: Change the user's password.
- `POST /api/v1/user/add-address`: Add a new address for the user.
- `GET /api/v1/user/get-addresses`: Get all the user's addresses.
- `DELETE /api/v1/user/delete-address`: Delete a user's address.
- `GET /api/v1/user/orders`: Get all the user's orders.
- `GET /api/v1/user/orders/:orderId`: Get the user's order details.

## API Endpoints v2

> All v2 endpoints are prefixed with `/api/v2`.

Work in progress...

## Key Dependencies

- **Express.js**: Web framework for Node.js.
- **Prisma**: Next-generation ORM for Node.js and TypeScript.
- **PostgreSQL**: The database used for this project.
- **Neon**: Serverless PostgreSQL hosting provider.
- **Render**: Cloud application hosting.
- **Bcrypt**: A library for hashing passwords.
- **JSON Web Token (JWT)**: For generating and verifying JSON Web Tokens.
- **Stripe**: For handling payments.
- **Nodemailer**: For sending emails.
- **MailDev**: For testing emails.