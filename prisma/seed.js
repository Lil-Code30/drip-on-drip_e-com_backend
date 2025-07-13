import { PrismaClient } from "../generated/prisma/default.js";
import { v4 as uuid4 } from "uuid";
import { generateSKU } from "../utils/utils.js";
import { allProducts } from "../utils/data.js";

// User data (from previous users array)
const users = [
  {
    id: 1,
    role: "ADMIN",
    email: "admin@example.com",
    password: "hashedpassword123",
    isActive: true,
    isVerified: true,
    profile: {
      firstName: "Alice",
      lastName: "Johnson",
      bio: "Admin user of the platform.",
      gender: "Female",
      avatarUrl: "https://example.com/avatar/alice.jpg",
      addressLine1: "123 Admin Street",
      addressLine2: null,
      city: "Toronto",
      state: "ON",
      postalCode: "M5G 2C3",
      country: "Canada",
      phoneNumber: "+1-416-555-1234",
      dateOfBirth: "1990-03-12T00:00:00.000Z",
    },
  },
  {
    id: 2,
    role: "USER",
    email: "user@example.com",
    password: "hashedpassword456",
    isActive: true,
    isVerified: false,
    profile: {
      firstName: "Bob",
      lastName: "Smith",
      bio: "Loyal customer and reviewer.",
      gender: "Male",
      avatarUrl: "https://example.com/avatar/bob.jpg",
      addressLine1: "456 User Road",
      addressLine2: "Apt 7B",
      city: "Montreal",
      state: "QC",
      postalCode: "H3B 1X8",
      country: "Canada",
      phoneNumber: "+1-514-555-5678",
      dateOfBirth: "1988-07-22T00:00:00.000Z",
    },
  },
];

const prisma = new PrismaClient();

async function main() {
  // Seed users and profiles
  for (const user of users) {
    const createdUser = await prisma.User.create({
      data: {
        role: user.role,
        email: user.email,
        password: user.password, // plain text as requested
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        isActive: user.isActive,
        isVerified: user.isVerified,
        profile: {
          create: {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            bio: user.profile.bio,
            gender: user.profile.gender,
            avatarUrl: user.profile.avatarUrl,
            addressLine1: user.profile.addressLine1,
            addressLine2: user.profile.addressLine2,
            city: user.profile.city,
            state: user.profile.state,
            postalCode: user.profile.postalCode,
            country: user.profile.country,
            phoneNumber: user.profile.phoneNumber,
            dateOfBirth: user.profile.dateOfBirth
              ? new Date(user.profile.dateOfBirth)
              : null,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
          },
        },
      },
    });
    console.log(`User created: ${createdUser.email}`);
  }

  // Seed products (existing logic follows)
  for (const product of allProducts) {
    // Ensure category exists or create it
    const category = await prisma.Category.upsert({
      where: { name: product.category },
      update: {},
      create: { name: product.category },
    });
    // Ensure brand exists or create it
    const brand = await prisma.Brand.upsert({
      where: { name: product.brand },
      update: {},
      create: { name: product.brand },
    });
    // Generate a UUID for product id
    const productId = uuid4();
    // Generate SKU if not present
    const sku =
      product.sku ||
      generateSKU({
        name: product.title || product.name,
        category: product.category,
      });
    // Upsert product
    const createdProduct = await prisma.Product.upsert({
      where: { id: productId },
      update: {},
      create: {
        id: productId,
        name: product.title || product.name,
        images: product.images,
        description: product.description,
        price: product.price,
        categoryId: category.id,
        discountPercentage: Math.round(product.discountPercentage || 0),
        rating: product.rating || 0,
        stock: product.stock || 0,
        tags: product.tags || [],
        brandId: brand.id,
        sku,
        weight: product.weight || null,
        dimensions: product.dimensions ? product.dimensions : null,
        warrantyInformation: product.warrantyInformation || null,
        shippingInformation: product.shippingInformation || null,
        availabilityStatus: product.availabilityStatus || "in_stock",
        returnPolicy: product.returnPolicy || null,
        minimumOrderQuantity: product.minimumOrderQuantity || 1,
      },
    });
    console.log(`Product created: ${createdProduct.name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
