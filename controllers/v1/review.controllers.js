import Prisma from "../../utils/dbConnection.js";

// custom function
const reviewsControllers = async (res, query, errMsg, noResultMsq = "") => {
  try {
    const response = await Prisma.reviews.findMany(query);

    if (!response || response.length === 0) {
      return res.status(404).json({ message: noResultMsq });
    }

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: errMsg + err.message });
  }
};

// get reviews of a specific product
export const getReviewsByProduct = async (req, res) => {
  const errMsg = "Error when fetching product's reviews";
  const noResultMsq = "No reviews found for this product";

  const { id } = req.params;
  if (!id || id === undefined) {
    return res
      .status(400)
      .json({ message: "Please enter a product id to get it's reviews" });
  }
  const query = {
    where: {
      productId: id,
    },
  };

  const data = await reviewsControllers(res, query, errMsg, noResultMsq);
  return data;
};

// need to test these 03 endpoints after creating a user
export const addProductReview = async (req, res) => {
  //fields : comment, productId, rating, reviewerName, userId, reviewerEmail

  const { comment, productId, rating, reviewerName, reviewerEmail } = req.body;
  if (!comment || !productId || !rating || !reviewerName || !reviewerEmail) {
    return res
      .status(400)
      .json({ message: "Please provide every fields to create a review" });
  }

  try {
    const review = await Prisma.reviews.create({
      data: {
        comment,
        productId,
        rating: parseFloat(rating),
        reviewerName,
        reviewerEmail,
      },
    });
    console.log(review);
    res.status(201).json({ message: "Review successfully created" });
  } catch (err) {
    res.status(500).json({
      error: `Something when wrong when adding the review ${err.message}`,
    });
  }
};

export const editProductReview = async (req, res) => {
  try {
    const { comment, productId, rating, reviewerName, reviewerEmail } =
      req.body;

    if (!comment || !productId || !rating || !reviewerName || !reviewerEmail) {
      return res
        .status(400)
        .json({ message: "Please provide every fields to modify the review" });
    }
    const { reviewId } = req.params;
    if (!reviewId) {
      return res
        .status(400)
        .json({ message: "Please provide the review id to be modify" });
    }
    const review = await Prisma.reviews.update({
      where: {
        id: reviewId,
      },
      data: {
        comment,
        productId,
        rating: parseFloat(rating),
        reviewerName,
        reviewerEmail,
      },
    });
    console.log(review);
    res.status(201).json({ message: "Review successfully created" });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Error when editing a the review ${err.message}` });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!reviewId) {
      return res
        .status(400)
        .json({ message: "Please provide the review id to be deleted" });
    }
    const review = await Prisma.reviews.delete({
      where: {
        id: reviewId,
      },
    });
    console.log(review);
    res.status(201).json({ message: "Review successfully deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Error when deleting the review ${err.message}` });
  }
};

// above
