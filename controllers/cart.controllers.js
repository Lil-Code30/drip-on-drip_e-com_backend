import Prisma from "../utils/dbConnection.js";
import { v4 as uuid4 } from "uuid";

export const getUserCart = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    if (!userId) {
      return res.status(401).json({
        message: "User must be connected inorder to access his/her cart",
      });
    }

    const cart = await Prisma.cart.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!cart) {
      await Prisma.cart.create({
        data: {
          id: uuid4(),
          userId: userId,
        },
      });
    }

    const cartId = cart.id;
    const cartItems = await Prisma.cartItem.findMany({
      where: {
        cartId: cartId,
      },
      include: {
        cart: true,
        product: {
          select: {
            name: true,
            images: true,
          },
        },
      },
    });

    if (!cartItems) {
      return res.status(404).json({ message: "No Product in your Cart" });
    }

    res.status(200).json(cartItems);
  } catch (err) {
    res
      .status(500)
      .json({ error: `Error when fetching user cart ${err.message}` });
  }
};

export const addProductInCart = async (req, res) => {
  try {
    const { userId, price, productId, quantity } = req.body;
    const findCart = await Prisma.cart.findUnique({
      where: {
        userId: userId,
      },
    });

    // verify if product is already in the user cart
    const findProductInCart = await Prisma.cartItem.findFirst({
      where: {
        productId,
        cartId: findCart.id,
      },
    });
    if (findProductInCart) {
      //update product quantity

      await Prisma.cartItem.update({
        where: {
          id: findProductInCart.id,
        },
        data: {
          quantity: findProductInCart.quantity + parseFloat(quantity),
        },
      });

      return res
        .status(201)
        .json({ message: "Product's quantity successfully updated in cart" });
    } else {
      await Prisma.cartItem.create({
        data: {
          cartId: findCart.id,
          price: parseFloat(price),
          productId,
          quantity: parseInt(quantity),
        },
      });

      return res
        .status(201)
        .json({ message: "Product successfully added to cart" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ Error: "Error when adding product in cart" + err.message });
  }
};

// Update item quantity
export const updateItemQtyInCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      return res
        .status(404)
        .json({ message: "Please provide id of the item to be modify" });
    }

    const { quantity } = req.body;

    const response = await Prisma.cartItem.update({
      where: {
        id: parseInt(itemId),
      },
      data: {
        quantity: parseInt(quantity),
      },
    });

    console.log(response);
    res.status(200).json({ message: "Product quantity updated" });
  } catch (err) {
    res.status(500).json({
      error: "Error when updating product quantity in cart" + err.message,
    });
  }
};

export const updateUserCart = async (req, res) => {
  /**
   * form for cartItem = [
   * {itemId, price, productId, quantity, userID},
   * {itemId, price, productId, quantity, userID}
   * ]
   */
  try {
    const { userId, cartItems } = req.body;
    const findCart = await Prisma.cart.findUnique({
      where: {
        userId: userId,
      },
    });

    await Promise.all(
      cartItems.map((item) =>
        Prisma.cartItem.updateMany({
          where: { productId: item.productId, cartId: findCart.id },
          data: { quantity: item.quantity },
        })
      )
    );

    res.status(200).json({ message: "Cart  updated" });
  } catch (err) {
    res.status(500).json({
      error: "Error when updating user cart" + err.message,
    });
  }
};

export const deleteItemInCart = async (req, res) => {
  try {
    const { productId, userId } = req.query;

    const findCart = await Prisma.cart.findUnique({
      where: {
        userId: parseInt(userId),
      },
    });

    const findProductInCart = await Prisma.cartItem.findFirst({
      where: {
        productId,
        cartId: findCart.id,
      },
    });

    await Prisma.cartItem.delete({
      where: {
        id: findProductInCart.id,
      },
    });

    res
      .status(200)
      .json({ message: "Item successfully deleted from the cart" });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Error when deleteing product in cart ${err}` });
  }
};

export const clearUserCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const findCart = await Prisma.cart.findUnique({
      where: {
        userId: parseInt(userId),
      },
    });
    if (findCart) {
      await Prisma.cartItem.deleteMany({
        where: {
          cartId: findCart.id,
        },
      });

      res.status(200).json({ message: "Cart successfully clear" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error when clearing the user cart " });
  }
};

//Admin work
export const deletetCart = async (req, res) => {
  try {
    const { cartId } = req.body;
    await Prisma.cart.deleteMany({
      where: {
        id: cartId,
      },
    });
    res.status(200).json({ message: "Cart deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ Error: "Error when deleting user cart " + err.message });
  }
};
