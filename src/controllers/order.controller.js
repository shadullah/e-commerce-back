import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createOrder = asyncHandler(async (req, res) => {
  const { orderPrice, division, district, address, phone, orderItems } =
    req.body;

  if (
    [orderPrice, division, district, address, phone].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const orderedItem = await Cart.findById(orderItems);

  if (!orderedItem) {
    throw new ApiError(400, "No ordered item found");
  }

  const placeOrder = await Order.create({
    orderPrice,
    division,
    district,
    address,
    phone,
    orderedItem: orderItems,
  });

  if (!placeOrder) {
    throw new ApiError(400, "Place Order failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, placeOrder, "Order Created success"));
});

export { createOrder };
