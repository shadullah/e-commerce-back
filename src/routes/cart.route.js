import { Router } from "express";
import {
  addItemToOrder,
  deleteAItem,
  getCartItems,
  updateOneCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, addItemToOrder);
router.route("/user/:id").get(getCartItems);
router.route("/:id").patch(updateOneCart);
router.route("/user/:id").delete(deleteAItem);

export default router;
