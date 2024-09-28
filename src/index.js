// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import axios from "axios";
import { Payment } from "./models/payment.model.js";
import mongoose from "mongoose";
import { ApiError } from "./utils/ApiError.js";

dotenv.config({
  path: "./.env",
});

app.get("/", (req, res) => {
  res.send("welcome to lazz pharma backend");
});

app.post("/create-payment", async (req, res) => {
  const payInfo = req.body;

  const trxId = new mongoose.Types.ObjectId().toString();

  const initiateData = {
    store_id: "ss66f78af2baee0",
    store_passwd: "ss66f78af2baee0@ssl",
    total_amount: payInfo.amount,
    currency: "EUR",
    tran_id: trxId,
    success_url: "http://localhost:8000/payment/success",
    fail_url: "http://localhost:8000/payment/failed",
    cancel_url: "http://localhost:8000/payment/cancelled",
    cus_name: "Customer Name",
    cus_email: "cust@yahoo.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    shipping_method: "No",
    product_name: "My Product",
    product_category: "electro",
    product_profile: "general",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: "1000",
    ship_country: "Bangladesh",
    multi_card_name: "mastercard,visacard,amexcard",
    value_a: "ref001_A",
    value_b: "ref002_B",
    value_c: "ref003_C",
    value_d: "ref004_D",
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

    const newPayment = new Payment({
      customer: "Shad",
      paymentId: trxId,
      amount: payInfo.amount,
      status: "Pending",
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

app.post("/success", async (req, res) => {
  const successdata = req.body;

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
    res
      .status(200)
      .json({ message: "Payment successfull", payment: updatedPayment });
  } catch (error) {
    console.error("Payment update failed", error.message);
    res.status(500).json({ error: "Payment update failed" });
  }
  res.redirect("http://localhost:3000/payment/success");
  console.log("successData", successdata);
});

app.post("/failed", async (req, res) => {
  try {
    res.redirect("http://localhost:3000/payment/fail");
  } catch (error) {
    console.error("Cancellation Error:", error);
    res.status(500).json({ message: "Error processing cancellation" });
  }
});

app.post("/cancelled", async (req, res) => {
  try {
    res.redirect("http://localhost:3000/payment/cancel");
  } catch (error) {
    console.error("Cancellation Error:", error);
    res.status(500).json({ message: "Error processing cancellation" });
  }
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed", err);
  });
