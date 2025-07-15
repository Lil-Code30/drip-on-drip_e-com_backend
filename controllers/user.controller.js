import Prisma from "../utils/dbConnection.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const { token } = req.token;

    const userProfile = await Prisma.profile.findUnique({
      where: {
        userId: parseInt(userId),
      },
      include: {
        user: true,
      },
    });

    if (userProfile) {
      res.status(200).json({ data: userProfile, token });
    }
  } catch (error) {
    res.status(500).json({ error: "Error when fetching user profile" });
  }
};
