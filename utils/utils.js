export function generateSKU(product) {
  // Example: First 3 letters of name + category + random 4 digits
  const namePart = product.name.substring(0, 3).toUpperCase();
  const categoryPart = product.category.substring(0, 3).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${namePart}-${categoryPart}-${randomPart}`;
}

// Usage:
const sku = generateSKU({ name: "T-shirt", category: "Apparel" });
// Example output: "T-S-APP-4821"
