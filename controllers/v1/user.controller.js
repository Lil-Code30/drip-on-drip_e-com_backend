import Prisma from "../../utils/dbConnection.js";
import bcrypt from "bcrypt";

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
        .json({ message: "User profile updated successfully" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error when updating user profile" + err.message });
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
    res
      .status(500)
      .json({ error: "Error when changing user password " + err.message });
  }
};

// api to change user address
export const changeUserAddress = async (req, res) => {
  const {
    profileId,
    nickname,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    stateOrProvince,
    postalCode,
    country,
  } = req.body;
  try {
    const createNewAddress = await Prisma.addresses.create({
      data: {
        profileId: parseInt(profileId),
        nickname: nickname,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state: stateOrProvince,
        postalCode,
        country,
      },
    });

    res.status(201).json({ message: "New user address created successfully" });
  } catch (err) {
    res.status(500).json(`error ${err.message}`);
  }
};

// api to get all user addresses
export const getUserAddresses = async (req, res) => {
  try {
    const { profileId } = req.query;
    const addresses = await Prisma.addresses.findMany({
      where: {
        profileId: parseInt(profileId),
      },
    });

    res.status(200).json(addresses);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error when fetching user address " + err.message });
  }
};

// api to delete user addresses
export const deleteUserAddress = async (req, res) => {
  try {
    const { addressId } = req.query;

    await Prisma.addresses.delete({
      where: {
        id: parseInt(addressId),
      },
    });

    res.status(200).json({ message: "User's address successfully deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error when delete user address " + err.message });
  }
};

// api to get user order history
export const getAllUserOrders = async (req, res) => {
  try {
    const { user } = req;
    const userId = user.userId;

    const profile = await Prisma.profile.findFirst({
      where: {
        userId: parseInt(userId),
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "user profile not found " });
    }

    const userOrders = await Prisma.order.findMany({
      where: {
        userId: profile.id,
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        billingFirstName: true,
        billingLastName: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(userOrders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error when fetching user's orders " + error.message });
  }
};

// api to get user order details
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user } = req;
    const userId = user.userId;

    const profile = await Prisma.profile.findFirst({
      where: {
        userId: parseInt(userId),
      },
    });
    if (!orderId) {
      return res
        .status(404)
        .json({ message: "Please provide an order id to get it's details" });
    }

    if (!profile) {
      return res.status(404).json({ message: "user profile not found " });
    }
    const orderDetails = await Prisma.order.findFirst({
      where: {
        id: orderId,
        userId: profile.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!orderDetails) {
      return res.status(404).json({ message: "Order not found " });
    }

    res.status(200).json(orderDetails);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error when fetching order details " + error.message });
  }
};
