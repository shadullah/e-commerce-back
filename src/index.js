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
    res.status(200).redirect("http://localhost:3000/payment/success");
  } catch (error) {
    console.error("Payment update failed", error.message);
    res.status(500).json({ error: "Payment update failed" });
  }
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
