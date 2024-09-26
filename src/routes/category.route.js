import { Router } from "express";
import {
  createCategory,
  deleteAcategory,
  getAllCategoy,
  getSingleCategory,
  updateAcategory,
} from "../controllers/category.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/create").post(
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  createCategory
);

router.route("/all").get(getAllCategoy);
router.route("/all/:id").put(
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  updateAcategory
);
router.route("/:id").delete(deleteAcategory);
router.route("/all/:id").get(getSingleCategory);

export default router;
