import Prisma from "../utils/dbConnection.js";
import { v4 as uuid4 } from "uuid";

export const getUserCart = async (req, res) => {
  try {
    const { cartId } = req.body;
    if (!cartId) {
      return res.status(404).json({ message: "Please provide the cart id" });
    }

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

    const userHasCart = await Prisma.cart.findUnique({
      where: {
        userId: userId,
      },
    });

    if (userHasCart) {
      const cartItemRes = await Prisma.cartItem.create({
        data: {
          cartId: userHasCart.id,
          price: parseFloat(price),
          productId,
          quantity: parseInt(quantity),
        },
      });

      console.log(cartItemRes);
      res.status(201).json({ message: "Product successfully added to cart" });
    } else {
      const cartId = uuid4();
      const cartRes = await Prisma.cart.create({
        data: {
          userId: userId,
          id: cartId,
        },
      });

      if (cartRes) {
        const cartItemRes = await Prisma.cartItem.create({
          data: {
            cartId: cartId,
            price: parseFloat(price),
            productId,
            quantity: parseInt(quantity),
          },
        });

        console.log(cartItemRes);
        res.status(201).json({ message: "Product successfully added to cart" });
      } else {
        return res.status(400).json({ error: "Error when creating user cart" });
      }
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
    const { cartItems } = req.body;

    await Promise.all(
      cartItems.map((item) =>
        Prisma.cartItem.update({
          where: { id: item.itemId },
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
    const { itemId } = req.params;

    if (!itemId) {
      return res
        .status(404)
        .json({ message: "Please provide item id to be deleted" });
    }

    await Prisma.cartItem.delete({
      where: {
        id: parseInt(itemId),
      },
    });

    res
      .status(200)
      .json({ message: "Item successfully deleted from the cart" });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Error when deleteing product in cart ${err.message}` });
  }
};

export const clearUserCart = async (req, res) => {
  try {
    const { cartId } = req.body;
    await Prisma.cartItem.deleteMany({
      where: {
        cartId: cartId,
      },
    });

    res.status(200).json({ message: "Cart successfully clear" });
  } catch (err) {
    res.status(500).json({ message: "Error when clearing the user cart " });
  }
};

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
