import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import { Payment } from "../models/payment.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";

const paymentInitiate = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  console.log(orderId);

  const order = await Order.findById(orderId);
  console.log(order);
  if (!order) {
    throw new ApiError(400, "Order not found");
  }

  const existingPayment = await Payment.findOne({ orderId });

  if (existingPayment) {
    console.log("Existing payment found", existingPayment);
    return res.status(200).json({
      message: "Payment already initiated",
      paymentUrl: existingPayment.paymentUrl,
    });
  }

  const trxId = new mongoose.Types.ObjectId().toString();

  const initiateData = {
    store_id: "ss66f78af2baee0",
    store_passwd: "ss66f78af2baee0@ssl",
    total_amount: order.orderPrice,
    // orderPrice: payInfo.orderPrice,
    currency: "BDT",
    tran_id: trxId,
    success_url: "http://localhost:8000/api/v1/payments/success",
    fail_url: "http://localhost:8000/failed",
    cancel_url: "http://localhost:8000/cancelled",
    cus_name: order.customer,
    cus_email: "cust@yahoo.com",
    cus_add1: order.address,
    cus_city: order.city,
    cus_country: "Bangladesh",
    cus_postcode: order.zip,
    cus_phone: order.phone,
    // cus_fax: "01711111111",
    // ship_name: "Customer Name",
    // ship_add1: "Dhaka",
    // ship_add2: "Dhaka",
    shipping_method: "No",
    product_name: "My Product",
    product_category: "electro",
    product_profile: "general",
    // ship_city: "Dhaka",
    // ship_state: "Dhaka",
    // ship_postcode: "1000",
    // ship_country: "Bangladesh",
    // multi_card_name: "mastercard,visacard,amexcard",
    // value_a: "ref001_A",
    // value_b: "ref002_B",
    // value_c: "ref003_C",
    // value_d: "ref004_D",
  };

  try {
    const response = await axios({
      method: "POST",
      url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      data: initiateData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // console.log(amount);

    const newPayment = new Payment({
      customer: order.customer,
      paymentId: trxId,
      orderPrice: order.orderPrice,
      orderId: order?._id,
    });

    const saveRes = await newPayment.save();

    console.log("Payment initiation successful", response.data);
    if (saveRes) {
      res.send({
        paymentUrl: response.data.GatewayPageURL,
      });
    }
  } catch (error) {
    console.error("Payment initiation failed", error.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

const successPayment = asyncHandler(async (req, res) => {
  const successdata = req.body;
  console.log(successdata);

  if (successdata.status !== "VALID") {
    throw new ApiError(404, " Invalid Payment");
  }

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { paymentId: successdata.tran_id },
      { status: "Success" },
      { new: true }
    );

    if (!updatedPayment) {
      throw new ApiError(404, "Payment not found");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      updatedPayment.orderId,
      { isPaid: true },
      { new: true }
    );

    if (!updatedOrder) {
      throw new ApiError(404, "Order not found");
    }

    console.log("Order updated successfully:", updatedOrder);

    res.status(200).redirect("http://localhost:3000/dashboard/overview_order");
  } catch (error) {
    console.error("Payment update failed", error.message);
    res.status(500).json({ error: "Payment update failed" });
  }
  console.log("successData", successdata);
});

export { paymentInitiate, successPayment };
