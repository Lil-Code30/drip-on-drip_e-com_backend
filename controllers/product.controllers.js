import Prisma from "../utils/dbConnection.js";

export const getAllProducts = async (req, res) => {
  try {
  } catch (err) {
    res.status(400).json({ err: `Error when fetching all products` });
  }
};
