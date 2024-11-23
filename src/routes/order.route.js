import { Router } from "express";
import { createOrder, getUserOrder } from "../controllers/order.controller.js";

const router = Router();

router.route("/create").post(createOrder);
router.route("/user/:id").get(getUserOrder);
// router.route("create-payment").post()

export default router;
