import Prisma from "../utils/dbConnection.js";

export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Prisma.product.findMany({
      include: {
        category: true,
        brand: true,
      },
    });
    if (!allProducts) {
      throw new Error("No Products found");
    }

    res.status(200).json(allProducts);
  } catch (error) {
    res
      .status(400)
      .json({ error: `Error when fetching all products ${error.message}` });
  }
};

export const getProductById = async (req, res) => {
  try {
    if (req.params.id === null) {
      return res.status(400).json({ error: "Please Prodive a product id" });
    }
    const { id } = req.params;
    const product = await Prisma.product.findUnique({
      where: {
        id: id,
      },
    });

    if (product === null) {
      return res
        .status(404)
        .json({ error: `No product found with id : ${id}` });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: "Error when fetching the product" });
  }
};

// NOTE add, update and delete (Admin) Product will be done later
export const addNewProduct = async (res, req) => {};

export const searchProducts = async (req, res) => {
  const { term } = req.query;
  console.log(term);

  if (!term || term === undefined || term === "" || term === null) {
    return res.status(404).json({ error: `Please enter a search a term` });
  }
  try {
    const searchProducts = await Prisma.product.findMany({
      where: {
        name: {
          contains: `${term}`,
          mode: "insensitive",
        },
      },
      include: {
        category: true,
        brand: true,
      },
    });

    if (searchProducts.length === 0) {
      return res
        .status(404)
        .json({ error: `No product found with this search term` });
    }
    res.status(200).json(searchProducts);
  } catch (error) {
    res.status(400).json({ error: "error when searching product" });
  }
};
/**
 *  get product by - category , price range(min - max), rating
 */
// export const getProductsByCategory = async (req, res) => {
//   try {
//     if (req.params.category === null) {
//       return res.status(400).json({ error: "Please Prodive a category name" });
//     }
//     const { categories } = req.params;
//     const productByCategory = await Prisma.product.findMany({
//       where: {
//         categoryId: {
//           id: {
//             in: Number(categories),
//           },
//         },
//       },
//       include: {
//         category: true,
//         brand: true,
//       },
//     });

//     if (productByCategory === null) {
//       return res
//         .status(404)
//         .json({ error: `No products found with categories : ${category}` });
//     }
//     res.status(200).json(productByCategory);
//   } catch (err) {
//     res
//       .status(400)
//       .json({ error: "Error when fetching the product by category" });
//   }
// };
