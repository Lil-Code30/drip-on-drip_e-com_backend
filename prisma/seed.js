import dotenv from "dotenv";
dotenv.config();
import Prisma from "../utils/dbConnection.js";
import { v4 as uuid4 } from "uuid";
import fs from "fs";
import path from "path";
import { generateSKU } from "../utils/utils.js";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { allProducts } from "../utils/data.js";

/*  Seeding strategy
    - Users (>=10) with profiles (1:1) & addresses (1..n) & carts
    - Categories & Brands from products + random extras
    - Products (>= allProducts length OR 30) referencing categories/brands
    - Reviews (>= 50) referencing products & profiles
    - Carts items (simulate some carts having products)
    - Orders (>=20) with items (1..5/product) & payments (some paid, failed, refunded)
    - EmailVerification (some pending codes)
    - refreshTokens (>=10) for session analytics
*/

const TOTAL_USERS = 15;
const ADDRESSES_PER_USER_RANGE = [1, 3];
const CART_ITEM_RANGE = [0, 5];
const TOTAL_ORDERS = 25;
const ORDER_ITEMS_RANGE = [1, 5];
const TOTAL_EXTRA_CATEGORIES = 5;
const TOTAL_EXTRA_BRANDS = 5;
const TARGET_REVIEWS = 80;

async function reset() {
  if (process.env.RESET_DB === "true") {
    console.log("Resetting database (truncate all tables)...");
    await Prisma.$executeRawUnsafe(
      'TRUNCATE "Payment","OrderItem","Order","CartItem","Cart","Reviews","Product","Brand","Category","Addresses","Profile","refreshToken","EmailVerification","User" RESTART IDENTITY CASCADE;'
    );
  }
}

const seedUserCredentials = [];

async function seedUsers() {
  const users = [];
  for (let i = 0; i < TOTAL_USERS; i++) {
    // Plain password pattern for easy dev usage
    const plainPassword = i === 0 ? "AdminPass123!" : "UserPass123!"; // Keep simple & predictable
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const email = faker.internet.email({ provider: "example.com" });
    const user = await Prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: i === 0 ? "ADMIN" : "USER",
        isActive: true,
        isVerified: faker.datatype.boolean({ probability: 0.7 }),
        profile: {
          create: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            gender: faker.helpers.arrayElement([
              "male",
              "female",
              "other",
              null,
            ]),
            dateOfBirth: faker.date.birthdate({
              min: 18,
              max: 55,
              mode: "age",
            }),
          },
        },
      },
      include: { profile: true },
    });
    users.push(user);
    seedUserCredentials.push({
      email,
      role: user.role,
      password: plainPassword,
    });
  }
  console.log(`Users created: ${users.length}`);
  return users;
}

async function seedAddresses(profiles) {
  let count = 0;
  for (const p of profiles) {
    const howMany = faker.number.int({
      min: ADDRESSES_PER_USER_RANGE[0],
      max: ADDRESSES_PER_USER_RANGE[1],
    });
    for (let i = 0; i < howMany; i++) {
      await Prisma.addresses.create({
        data: {
          profileId: p.id,
          nickname: i === 0 ? "Home" : faker.word.noun(),
          isDefault: i === 0,
          addressLine1: faker.location.streetAddress(),
          addressLine2: faker.datatype.boolean({ probability: 0.3 })
            ? faker.location.secondaryAddress()
            : null,
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
          phoneNumber: faker.phone.number(),
        },
      });
      count++;
    }
  }
  console.log(`Addresses created: ${count}`);
}

async function seedCategoriesAndBrands() {
  const existingCategories = new Set();
  const existingBrands = new Set();

  // From provided product data
  for (const p of allProducts) {
    existingCategories.add(p.category);
    existingBrands.add(p.brand);
  }
  // Add extras
  const targetCatSize = existingCategories.size + TOTAL_EXTRA_CATEGORIES;
  const targetBrandSize = existingBrands.size + TOTAL_EXTRA_BRANDS;
  while (existingCategories.size < targetCatSize)
    existingCategories.add(faker.commerce.department());
  while (existingBrands.size < targetBrandSize)
    existingBrands.add(faker.company.name());
  const catMap = new Map();
  const brandMap = new Map();
  for (const name of existingCategories) {
    const cat = await Prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    catMap.set(name, cat.id);
  }
  for (const name of existingBrands) {
    const brand = await Prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    brandMap.set(name, brand.id);
  }
  console.log(`Categories: ${catMap.size}, Brands: ${brandMap.size}`);
  return { catMap, brandMap };
}

function randomDimensions() {
  return {
    width: faker.number.float({ min: 5, max: 50, fractionDigits: 1 }),
    height: faker.number.float({ min: 5, max: 50, fractionDigits: 1 }),
    depth: faker.number.float({ min: 1, max: 30, fractionDigits: 1 }),
    unit: "cm",
  };
}

async function seedProducts(catMap, brandMap) {
  const products = [];
  const base =
    allProducts.length < 30 ? [...allProducts] : allProducts.slice(0, 30);
  // Duplicate / extend to ensure at least 30
  while (base.length < 30) {
    base.push({ ...faker.helpers.arrayElement(allProducts) });
  }
  for (const p of base) {
    const categoryName = faker.helpers.arrayElement([...catMap.keys()]);
    const brandName = faker.helpers.arrayElement([...brandMap.keys()]);
    const id = uuid4();
    const product = await Prisma.product.create({
      data: {
        id,
        name: p.title || p.name || faker.commerce.productName(),
        images:
          p.images && p.images.length
            ? p.images
            : [faker.image.urlLoremFlickr({ category: "fashion" })],
        description: p.description || faker.commerce.productDescription(),
        price:
          Number(p.price) ||
          Number(faker.commerce.price({ min: 10, max: 500 })),
        categoryId: catMap.get(categoryName),
        discountPercentage: faker.number.int({ min: 0, max: 50 }),
        rating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
        stock: faker.number.int({ min: 0, max: 500 }),
        tags:
          p.tags && p.tags.length
            ? p.tags
            : [
                faker.commerce.productAdjective(),
                faker.commerce.productMaterial(),
              ],
        brandId: brandMap.get(brandName),
        sku: generateSKU({
          name: p.title || p.name || "Prod",
          category: categoryName,
        }),
        weight: faker.number.float({ min: 0.2, max: 15, fractionDigits: 2 }),
        dimensions: randomDimensions(),
        warrantyInformation: faker.datatype.boolean({ probability: 0.4 })
          ? `${faker.number.int({ min: 3, max: 24 })} months warranty`
          : null,
        shippingInformation: faker.datatype.boolean({ probability: 0.6 })
          ? "Ships in 3-5 business days"
          : null,
        availabilityStatus: faker.helpers.arrayElement([
          "in_stock",
          "out_of_stock",
          "preorder",
        ]),
        // returnPolicy is non-nullable in schema, provide default if absent
        returnPolicy: "30-day returns",
        minimumOrderQuantity: faker.number.int({ min: 1, max: 5 }),
      },
    });
    products.push(product);
  }
  console.log(`Products created: ${products.length}`);
  return products;
}

async function seedCarts(profiles, products) {
  const carts = [];
  for (const p of profiles) {
    const cartId = uuid4();
    // Upsert to avoid unique constraint violation on userId
    const cart = await Prisma.cart.upsert({
      where: { userId: p.id },
      update: {},
      create: { id: cartId, userId: p.id },
    });
    carts.push(cart);
    const itemCount = faker.number.int({
      min: CART_ITEM_RANGE[0],
      max: CART_ITEM_RANGE[1],
    });
    for (let i = 0; i < itemCount; i++) {
      const prod = faker.helpers.arrayElement(products);
      await Prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: prod.id,
          quantity: faker.number.int({ min: 1, max: 4 }),
          price: prod.price,
        },
      });
    }
  }
  console.log(`Carts created: ${carts.length}`);
}

async function seedReviews(products, profiles) {
  let created = 0;
  while (created < TARGET_REVIEWS) {
    const prod = faker.helpers.arrayElement(products);
    const prof = faker.helpers.arrayElement(profiles);
    await Prisma.reviews.create({
      data: {
        comment: faker.lorem.sentences({ min: 1, max: 3 }),
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        reviewerName: `${prof.firstName || faker.person.firstName()} ${
          prof.lastName || ""
        }`.trim(),
        reviewerEmail: faker.internet.email(),
        productId: prod.id,
        userId: prof.id,
      },
    });
    created++;
  }
  console.log(`Reviews created: ${created}`);
}

function computeOrderTotals(items) {
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const discount =
    subtotal * faker.number.float({ min: 0, max: 0.2, fractionDigits: 2 });
  const taxedBase = subtotal - discount;
  const tax = taxedBase * 0.13; // assume 13% tax
  const shippingAmount =
    taxedBase > 150
      ? 0
      : faker.number.float({ min: 5, max: 25, fractionDigits: 2 });
  const totalPrice = taxedBase + tax + shippingAmount;
  return { subtotal, discount, tax, shippingAmount, totalPrice };
}

async function seedOrdersAndPayments(products, profiles) {
  const orders = [];
  for (let i = 0; i < TOTAL_ORDERS; i++) {
    const prof = faker.helpers.arrayElement(profiles);
    const orderItemsCount = faker.number.int({
      min: ORDER_ITEMS_RANGE[0],
      max: ORDER_ITEMS_RANGE[1],
    });
    const chosenProducts = faker.helpers.arrayElements(
      products,
      orderItemsCount
    );
    const itemsTemp = chosenProducts.map((p) => ({
      productId: p.id,
      price: p.price,
      quantity: faker.number.int({ min: 1, max: 4 }),
    }));
    const { subtotal, discount, tax, shippingAmount, totalPrice } =
      computeOrderTotals(itemsTemp);
    const id = uuid4();
    const status = faker.helpers.arrayElement([
      "pending",
      "processing",
      "shipped",
      "completed",
      "cancelled",
    ]);
    const order = await Prisma.order.create({
      data: {
        id,
        userId: prof.id,
        subtotal,
        discount,
        tax,
        shippingAmount,
        totalPrice,
        status,
        currency: "CAD",
        billingFirstName: prof.firstName || faker.person.firstName(),
        billingLastName: prof.lastName || faker.person.lastName(),
        billingAddressLine1: faker.location.streetAddress(),
        billingAddressLine2: faker.datatype.boolean({ probability: 0.3 })
          ? faker.location.secondaryAddress()
          : null,
        billingCity: faker.location.city(),
        billingState: faker.location.state(),
        billingPostalCode: faker.location.zipCode(),
        billingCountry: faker.location.country(),
        billingPhoneNumber: faker.phone.number(),
        billingEmail: faker.internet.email(),
        shippingFirstName: faker.datatype.boolean({ probability: 0.8 })
          ? prof.firstName || faker.person.firstName()
          : null,
        shippingLastName: faker.datatype.boolean({ probability: 0.8 })
          ? prof.lastName || faker.person.lastName()
          : null,
        shippingAddressLine1: faker.datatype.boolean({ probability: 0.8 })
          ? faker.location.streetAddress()
          : null,
        shippingAddressLine2: null,
        shippingCity: faker.datatype.boolean({ probability: 0.8 })
          ? faker.location.city()
          : null,
        shippingState: faker.datatype.boolean({ probability: 0.8 })
          ? faker.location.state()
          : null,
        shippingPostalCode: faker.datatype.boolean({ probability: 0.8 })
          ? faker.location.zipCode()
          : null,
        shippingCountry: faker.datatype.boolean({ probability: 0.8 })
          ? faker.location.country()
          : null,
        shippingPhoneNumber: faker.datatype.boolean({ probability: 0.7 })
          ? faker.phone.number()
          : null,
        shippingEmail: faker.datatype.boolean({ probability: 0.7 })
          ? faker.internet.email()
          : null,
        additionalInfo: faker.datatype.boolean({ probability: 0.4 })
          ? faker.lorem.sentence()
          : null,
      },
    });
    for (const it of itemsTemp) {
      await Prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: it.productId,
          quantity: it.quantity,
          price: it.price,
        },
      });
    }
    // Payment simulation
    const paymentStatus = faker.helpers.arrayElement([
      "pending",
      "completed",
      "failed",
      "refunded",
      "cancelled",
    ]);
    await Prisma.payment.create({
      data: {
        id: uuid4(),
        orderId: order.id,
        amount: totalPrice,
        currency: "CAD",
        paymentMethod: faker.helpers.arrayElement([
          "credit_card",
          "paypal",
          "stripe",
        ]),
        paymentStatus,
        transactionId: faker.datatype.boolean({ probability: 0.7 })
          ? uuid4()
          : null,
        failureReason: paymentStatus === "failed" ? faker.lorem.words(4) : null,
        processedAt: paymentStatus === "completed" ? new Date() : null,
        gatewayResponse: faker.datatype.boolean({ probability: 0.5 })
          ? { raw: faker.lorem.sentence() }
          : null,
      },
    });
    orders.push(order);
  }
  console.log(`Orders created: ${orders.length}`);
  return orders;
}

async function seedEmailVerifications(users) {
  let count = 0;
  for (const user of users) {
    if (!user.isVerified && faker.datatype.boolean({ probability: 0.5 })) {
      const createdAt = new Date();
      const expiredAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
      await Prisma.emailVerification.create({
        data: {
          userId: user.id,
          email: user.email,
          code: faker.string.numeric(6),
          createdAt,
          expiredAt,
        },
      });
      count++;
    }
  }
  console.log(`Email verification codes created: ${count}`);
}

async function seedRefreshTokens(users) {
  let count = 0;
  for (const user of users) {
    if (faker.datatype.boolean({ probability: 0.7 })) {
      await Prisma.refreshToken.create({
        data: {
          id: uuid4(),
          userId: user.id,
          refresToken: uuid4(),
          createdAt: new Date(),
          expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isRevoked: faker.datatype.boolean({ probability: 0.1 }),
        },
      });
      count++;
    }
  }
  console.log(`Refresh tokens created: ${count}`);
}

async function main() {
  console.log("Seeding started...");
  await reset();
  const users = await seedUsers();
  const profiles = await Prisma.profile.findMany();
  await seedAddresses(profiles);
  const { catMap, brandMap } = await seedCategoriesAndBrands();
  const products = await seedProducts(catMap, brandMap);
  await seedCarts(profiles, products);
  await seedReviews(products, profiles);
  await seedOrdersAndPayments(products, profiles);
  await seedEmailVerifications(users);
  await seedRefreshTokens(users);
  // Write credentials file for dev convenience (never use in production)
  try {
    const outDir = path.resolve(process.cwd(), "logs");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const filePath = path.join(outDir, "seeded-users.json");
    fs.writeFileSync(filePath, JSON.stringify(seedUserCredentials, null, 2));
    console.log(`Plain user credentials written to: ${filePath}`);
  } catch (e) {
    console.warn("Failed to write seeded user credentials file:", e.message);
  }
  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await Prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await Prisma.$disconnect();
    process.exit(1);
  });
