import { Router } from "express";
import { createOrder } from "../controllers/order.controller.js";

const router = Router();

router.route("/create").post(createOrder);
// router.route("create-payment").post()

export default router;
