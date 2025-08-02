# DripOnDrip E-commerce Backend

This is the backend for the DripOnDrip e-commerce platform. It is a Node.js application built with Express.js and Prisma.

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
3.  Set up your environment variables by creating a `.env` file in the root of the project. You will need to add the following variables:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
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

The application will be available at `http://localhost:3000`.

## Available Scripts

-   `npm start`: Starts the application.
-   `npm run watch`: Starts the application in watch mode.
-   `npm run maildev`: Starts MailDev for email testing.

## API Endpoints

### Authentication

-   `POST /auth/register`: Register a new user.
-   `POST /auth/login`: Login a user.
-   `POST /auth/logout`: Logout a user.
-   `POST /auth/verify-email`: Verify a user's email.
-   `GET /auth/request-email-verification-code`: Request a new email verification code.
-   `GET /auth/refresh-token`: Refresh a user's access token.
-   `PUT /auth/change-password`: Change a user's password.

### Cart

-   `GET /cart`: Get the user's cart.
-   `POST /cart`: Add a product to the cart.
-   `PUT /cart`: Update the user's cart.
-   `DELETE /cart/user-cart`: Delete an item from the cart.
-   `DELETE /cart/:userId`: Clear the user's cart.

### Payment

-   `POST /payment/create-payment-intent`: Create a payment intent.

### Products

-   `GET /products`: Get all products.
-   `GET /products/search`: Search for products.
-   `GET /products/category/:category`: Get products by category.
-   `GET /products/featuredProducts`: Get featured products.
-   `GET /products/latestProducts`: Get the latest products.
-   `GET /products/:id`: Get a product by its ID.

### Reviews

-   `GET /reviews/:id`: Get all reviews for a product.
-   `POST /reviews/:id`: Add a review to a product.
-   `PUT /reviews/:reviewId`: Edit a product review.
-   `DELETE /reviews/:reviewId`: Delete a product review.

### User

-   `GET /user/profile`: Get the user's profile.
-   `PUT /user/profile`: Update the user's profile.
-   `PUT /user/change-password`: Change the user's password.
-   `POST /user/add-address`: Add a new address for the user.
-   `GET /user/get-addresses`: Get all the user's addresses.
-   `DELETE /user/delete-address`: Delete a user's address.

## Key Dependencies

-   **Express.js**: Web framework for Node.js.
-   **Prisma**: Next-generation ORM for Node.js and TypeScript.
-   **PostgreSQL**: The database used for this project.
-   **Bcrypt**: A library for hashing passwords.
-   **JSON Web Token (JWT)**: For generating and verifying JSON Web Tokens.
-   **Stripe**: For handling payments.
-   **Nodemailer**: For sending emails.
-   **MailDev**: For testing emails.
