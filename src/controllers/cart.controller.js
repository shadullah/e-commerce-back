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

  let itemOrdered = await Cart.create({
    customer,
    productId,
    quantity,
  });

  if (!itemOrdered) {
    throw new ApiError(400, "Error in creating cart item");
  }

  itemOrdered = await itemOrdered.populate("productId");

  res
    .status(200)
    .json(new ApiResponse(200, itemOrdered, "Cart item created successfully"));
});

// Get all Cart items
const getCartItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cart = await Cart.find({ customer: id }).populate("productId");

  if (!cart) {
    throw new ApiError(400, "Cart is empty");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "cart fetched successfully"));
});

const updateOneCart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { quantity } = req.body;

  const cart = await Cart.findById(id);

  if (!cart) {
    throw new ApiError(404, "cart not found");
  }

  if (quantity) {
    cart.quantity = quantity;
    cart.price = quantity * cart.price;
  }

  const updatedCart = await cartId.save();
  console.log(updatedCart);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCart, "Updated cart success"));
});

const deleteAItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { customerId } = req.body;

  const cartItem = await Cart.findById(id);

  if (!cartItem) {
    throw new ApiError(404, "Cart Item not found");
  }
  console.log(customerId);
  console.log(cartItem.customer.toString());

  if (cartItem.customer.toString() !== customerId) {
    throw new ApiError(403, "Unauthorized to delete this Item");
  }

  const deleteUserCartItem = await Cart.findByIdAndDelete(id);

  if (!deleteUserCartItem) {
    throw new ApiError(500, "Something wrong in deleting cartItem");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteUserCartItem, "cart item deleted successfully")
    );
});

export { addItemToOrder, getCartItems, updateOneCart, deleteAItem };
