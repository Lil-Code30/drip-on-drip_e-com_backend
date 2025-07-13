import { PrismaClient } from "../generated/prisma/client.js";
import { v4 as uuid4 } from "uuid";
import { generateSKU } from "../utils/utils.js";
import { allProducts } from "../utils/data.js";

/*
When you want to use prisma migrate dev or prisma migrate reset without seeding, you can pass the --skip-seed flag.
*/
const prisma = new PrismaClient();

async function main() {
  // for (const product of allProducts) {
  //   // Ensure category exists or create it
  //   const category = await prisma.Category.upsert({
  //     where: { name: product.category },
  //     update: {},
  //     create: { name: product.category },
  //   });
  //   // Ensure brand exists or create it
  //   const brand = await prisma.Brand.upsert({
  //     where: { name: product.brand },
  //     update: {},
  //     create: { name: product.brand },
  //   });
  //   // Generate a UUID for product id
  //   const productId = uuid4();
  //   // Generate SKU if not present
  //   const sku =
  //     product.sku ||
  //     generateSKU({
  //       name: product.title || product.name,
  //       category: product.category,
  //     });
  //   // Upsert product
  //   const createdProduct = await prisma.Product.upsert({
  //     where: { id: productId },
  //     update: {},
  //     create: {
  //       id: productId,
  //       name: product.title || product.name,
  //       images: product.images,
  //       description: product.description,
  //       price: product.price,
  //       categoryId: category.id,
  //       discountPercentage: Math.round(product.discountPercentage || 0),
  //       rating: product.rating || 0,
  //       stock: product.stock || 0,
  //       tags: product.tags || [],
  //       brandId: brand.id,
  //       sku,
  //       weight: product.weight || null,
  //       dimensions: product.dimensions ? product.dimensions : null,
  //       warrantyInformation: product.warrantyInformation || null,
  //       shippingInformation: product.shippingInformation || null,
  //       availabilityStatus: product.availabilityStatus || "in_stock",
  //       returnPolicy: product.returnPolicy || null,
  //       minimumOrderQuantity: product.minimumOrderQuantity || 1,
  //     },
  //   });
  //   console.log(`Product created: ${createdProduct.name}`);
  // }

  const createdUser = await prisma.Category.upsert({
    where: { email: product.category },
    update: {},
    create: { name: product.category },
  });
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
