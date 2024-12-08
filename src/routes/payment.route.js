import { Router } from "express";
import {
  paymentInitiate,
  successPayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.route("/create-payment").post(paymentInitiate);
router.route("/success").post(successPayment);

export default router;
