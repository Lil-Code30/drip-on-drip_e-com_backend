import Prisma from "../utils/dbConnection.js";

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


//change user password
export const changeUserPassword = async (req, res) => {
  try {
    const { token, user } = req;
    const { oldPassword, newPassword } = req.body;

    const userInfos = await Prisma.user.findUnique({
      where: {
        id: user.userId,
      },
    });

    const isValidPassword = await bcrypt.compare(
      oldPassword,
      userInfos.password
    );

    if (isValidPassword) {
      const hashNewPassowrd = await bcrypt.hash(newPassword, 10);

      await Prisma.user.update({
        where: {
          id: user.userId,
        },
        data: {
          password: hashNewPassowrd,
        },
      });

      return res
        .status(200)
        .json({ message: "User password updated successfully" });
    } else {
      return res.status(401).json({ message: "Old password incorrect" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error when changing user password" });
  }
};
/**
 * Profile todo api
 * -
 * - APi to get/update user addresses - edit user address, delete address
 * - API to change user password
 * - api to get user order -history - view order
 * - api for tracking order : to be done
 * -  api to close account or delete account
 */