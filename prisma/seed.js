import { PrismaClient } from "@prisma/client/default.js";
import { v4 as uuid4 } from "uuid";
import { generateSKU } from "../utils/utils.js";
import { allProducts } from "../utils/data.js";

const productId = uuid4();
const sku = generateSKU({
  name: "Blue & Black Check Shirt",
  category: "Fashion Trends",
});

const prisma = new PrismaClient();
async function main() {
  const BlueBlackCheckShirt = await prisma.Product.upsert({
    where: { id: productId },
    update: {},
    create: {
      id: productId,
      title: "Blue & Black Check Shirt",
      description:
        "The Blue & Black Check Shirt is a stylish and comfortable men's shirt featuring a classic check pattern. Made from high-quality fabric, it's suitable for both casual and semi-formal occasions.",
      categoryId: {
        connect: { id: 2 },
      },
      price: 29.99,
      discountPercentage: 15.35,
      rating: 3.64,
      stock: 38,
      tags: ["clothing", "men's shirts"],
      brandId: {
        connect: { id: 1 },
      },
      sku: sku,
      dimensions: JSON.parse(`{
        "width": 27.49,
        "height": 23.73,
        "depth": 28.61
      }`),
      warrantyInformation: "3 year warranty",
      shippingInformation: "Ships in 3-5 business days",
      availabilityStatus: "In Stock",
      returnPolicy: "30 days return policy",
      minimumOrderQuantity: 18,
      images: [
        "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/1.webp",
        "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/2.webp",
        "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/3.webp",
        "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/4.webp",
      ],
    },
  });
  console.log("Blue & Black Check Shirt created:", BlueBlackCheckShirt);
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
