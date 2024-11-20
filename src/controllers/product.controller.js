import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const AddProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discount, stock, category, owner } =
    req.body;
  console.log(req.body);

  if ([name, description, price, owner].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const productImagePath = req.files?.productImage[0]?.path;

  if (!productImagePath) {
    throw new ApiError(400, "product image path not found");
  }

  const productImage = await uploadOnCloudinary(productImagePath);

  if (!productImage) {
    throw new ApiError(400, "product image is required");
  }

  const categoryExist = await Category.findById(category);
  if (!categoryExist) {
    throw new ApiError(404, "Category not found");
  }

  const discountAmount = (price * discount) / 100;
  const discountedPrice = price - discountAmount;

  const createProduct = await Product.create({
    name,
    description,
    price: discountedPrice,
    discount,
    stock,
    productImage: productImage?.url,
    category,
    owner: owner,
  });

  if (!createProduct) {
    throw new ApiError(500, " Adding product error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createProduct, "Product Added success"));
});

const Allproducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const totalRecords = await Product.countDocuments();

  const { search, stock, sort } = req.query;

  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  // stock available condition
  if (stock === "true") {
    query.stock = true;
  } else if (stock === "false") {
    query.stock = false;
  }

  // sorting here
  let sortOption = {};

  if (sort === "true") {
    sortOption.price = 1;
  } else if (sort === "false") {
    sortOption.price = -1;
  }

  const products = await Product.find(query)
    .limit(limit)
    .skip(skip)
    .sort(sortOption);

  if (!products || products.length === 0) {
    throw new ApiError(404, "products not found");
  }

  const ttlPages = Math.ceil(totalRecords / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products, totalProducts: totalRecords, ttlPages, currentPage: page },
        "All Products fetched"
      )
    );
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Product Id required");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "product not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, product, "Product with id fetched Successfully")
    );
});

export { AddProduct, Allproducts, getSingleProduct };
