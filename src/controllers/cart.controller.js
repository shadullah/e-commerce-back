import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";

const addItemToOrder = asyncHandler(async (req, res) => {
  const { customer, productId, quantity } = req.body;
  console.log(customer, productId);
  console.log(req.body);

  if (!(productId && quantity)) {
    throw new ApiError(400, "All fields are required");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const customerId = await User.findById(customer);
  if (!customerId) {
    throw new ApiError(404, "Customer not found");
  }

  let cart = await Cart.findOne({ customer });

  if (!cart) {
    cart = new Cart({
      customer,
      cartItems: [{ productId, quantity }],
    });
  } else {
    const existingItem = cart.cartItems.find(
      (item) => item.productId.toString() === productId
    );
    if (existingItem) {
      throw new ApiError(400, "Product already in the cart");
    }

    cart.cartItems.push({ productId, quantity });
  }

  await cart.save();

  await cart.populate("cartItems.productId");
  // await cart.populate("cartItems.productId").execPopulate();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item created successfully"));
});

// Get all Cart items
const getCartItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cart = await Cart.findOne({ customer: id }).populate(
    "cartItems.productId"
  );

  if (!cart) {
    throw new ApiError(400, "Cart is empty");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "cart fetched successfully"));
});

const updateOneCart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { productId, quantity } = req.body;

  const cart = await Cart.findById(id);

  if (!cart) {
    throw new ApiError(404, "cart not found");
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart");
  }

  cart.cartItems[itemIndex].quantity = quantity;

  const updatedCart = await cart.save();
  console.log(updatedCart);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCart, "Updated cart success"));
});

const deleteAItem = asyncHandler(async (req, res) => {
  const { id, productId } = req.params;

  const cart = await Cart.findOne({ customer: id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const intialItemCount = cart.cartItems.length;

  cart.cartItems = cart.cartItems.filter(
    (item) => item.productId.toString() !== productId
  );

  if (cart.cartItems.length === intialItemCount) {
    throw new ApiError(404, "product not found in the cart");
  }

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "cart item deleted successfully"));
});

export { addItemToOrder, getCartItems, updateOneCart, deleteAItem };
