import Prisma from "../utils/dbConnection.js";
import { getDefinedQueryData } from "../utils/utils.js";

export const getUserProfile = async (req, res) => {
  try {
    const { token, user } = req;

    const userProfile = await Prisma.profile.findUnique({
      where: {
        userId: parseInt(user.userId),
      },
    });

    if (userProfile) {
      res.status(200).json({ data: userProfile, token, user });
    }
  } catch (error) {
    res.status(500).json({ error: "Error when fetching user profile" });
  }
};

// need to add more profile data to be updated
export const updateUserProfile = async (req, res) => {
  try {
    const { token, user } = req;
    const { firstName, lastName, gender, dateOfBirth } = req.body;
    // const {} = getDefinedQueryData(req.body);
  let DOB_correctFormat = new Date(dateOfBirth);
    DOB_correctFormat = DOB_correctFormat.toISOString();
  
    const updateProfile = await Prisma.profile.update({
      where: {
        userId: parseInt(user.userId),
      },
      data: {
        firstName,
        lastName,
        gender, 
        dateOfBirth: DOB_correctFormat,
      },
    });
    if (updateProfile) {
      return res
        .status(200)
        .json({ token, message: "User profile updated successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error when updating user profile" + err.message });
  }
};
