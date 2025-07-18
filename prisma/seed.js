import Prisma from "../utils/dbConnection.js";
import { v4 as uuid4 } from "uuid";
import { generateSKU } from "../utils/utils.js";
import { allProducts } from "../utils/data.js";

async function main() {
  // Seed products (existing logic follows)
  for (const product of allProducts) {
    // Ensure category exists or create it
    const category = await Prisma.category.upsert({
      where: { name: product.category },
      update: {},
      create: { name: product.category },
    });
    // Ensure brand exists or create it
    const brand = await Prisma.brand.upsert({
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
    const createdProduct = await Prisma.product.upsert({
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
    await Prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await Prisma.$disconnect();
    process.exit(1);
  });
