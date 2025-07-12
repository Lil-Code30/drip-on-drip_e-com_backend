import Prisma from "../utils/dbConnection.js";

// NOTE add, update and delete (Admin) Product will be done later
export const addNewProduct = async (res, req) => {};

// custom function
const productControllers = async (res, query, errMsg, noResultMsq = "") => {
  try {
    const response = await Prisma.product.findMany(query);

    if (!response || response.length === 0) {
      return res.status(404).json({ message: noResultMsq });
    }

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: errMsg + err.message });
  }
};

export const getAllProducts = async (req, res) => {
  // filters : category, minPrice, maxPrice, rating
  const { category, minPrice, maxPrice, rating } = req.query;
  const conditions = {
    isActive: true,
  };

  // verify if any above params exist
  if (category) {
    conditions.category = {
      name: category,
    };
  }

  if (rating) {
    conditions.rating = {
      gte: parseFloat(rating),
    };
  }

  if (minPrice || maxPrice) {
    conditions.price = {
      gte: parseFloat(minPrice),
      lte: parseFloat(maxPrice),
    };
  }

  const query = {
    where: conditions,
    include: {
      category: true,
      brand: true,
    },
  };

  const errMsq = "Error when fetching all products";
  const notFound = "No Product found ";

  const data = await productControllers(res, query, errMsq, notFound);
  return data;
};

export const getProductById = async (req, res) => {
  if (req.params.id === null) {
    return res.status(400).json({ error: "Please Prodive a product id" });
  }
  const { id } = req.params;
  const query = {
    where: {
      id: id,
    },
  };

  const errMsq = "Error when fetching the product";
  const notFound = `No product found with id : ${id}`;
  const data = await productControllers(res, query, errMsq, notFound);
  return data;
};

export const searchProducts = async (req, res) => {
  const { q } = req.query;
  if (!q || q === undefined || q === "" || q === null) {
    return res.status(404).json({ error: `Please enter a search a term` });
  }
  const query = {
    where: {
      name: {
        contains: `${q}`,
        mode: "insensitive",
      },
    },
    include: {
      category: true,
      brand: true,
    },
  };
  const noResultMsq = `No product found with this search term`;
  const errMsq = "error when searching product";
  const data = await productControllers(res, query, errMsq, noResultMsq);
  return data;
};
/**
 *  get product by - category , price range(min - max), rating
 */

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  if (
    category === null ||
    !category ||
    category === undefined ||
    category === ""
  ) {
    return res.status(400).json({ error: "Please Prodive a category name" });
  }

  const query = {
    where: {
      category: {
        name: category,
      },
    },
    include: {
      category: true,
      brand: true,
    },
  };
  const noResultMsq = `No products found with categories name : ${category}`;
  const errMsq = "Error when fetching the product by category";

  const data = await productControllers(res, query, errMsq, noResultMsq);

  return data;
};

export const getIsFeatureProduct = async (req, res) => {
  const query = {
    where: {
      isFeatured: true,
    },
    include: {
      category: true,
      brand: true,
    },
    take: 4,
  };

  const errMsg = "Error when fetching Feature products";
  const noResultMsq = "No Feature Products found";

  const data = await productControllers(res, query, errMsg, noResultMsq);

  return data;
};

export const getlatestProducts = async (req, res) => {
  const query = {
    include: {
      category: true,
      brand: true,
    },
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
  };

  const noResultMsq = "No latest Products found";
  const errMsg = "Error when fetching latest products";
  const data = await productControllers(res, query, errMsg, noResultMsq);
  return data;
};
