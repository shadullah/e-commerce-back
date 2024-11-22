import { Router } from "express";
import { paymentInitiate } from "../controllers/payment.controller.js";

const router = Router();

router.route("/create-payment").post(paymentInitiate);

export default router;
