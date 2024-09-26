import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  if ([name, slug].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbLocalPath = req.files?.thumbnail[0]?.path;

  if (!thumbLocalPath) {
    throw new ApiError(400, "thumbnail file is missing");
  }

  const thumbnail = await uploadOnCloudinary(thumbLocalPath);

  if (!thumbnail) {
    throw new ApiError(400, "thumbnail are required");
  }

  const createCategory = await Category.create({
    name,
    slug,
    thumbnail: thumbnail?.url,
  });

  if (!createCategory) {
    throw new ApiError(500, "Something wrong creating Category");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createCategory, "Category created successfully")
    );
});

const getAllCategoy = asyncHandler(async (req, res) => {
  const categories = await Category.find({});

  if (!categories || categories.length === 0) {
    throw new ApiError(400, "No categories found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

const updateAcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "invalid category id");
  }

  const { name, slug } = req.body;
  console.log(req.body);

  const categoryId = await Category.findById(id);

  if (!categoryId) {
    throw new ApiError(404, "Category not found");
  }

  if (name) {
    categoryId.name = name;
  }
  if (slug) {
    categoryId.slug = slug;
  }

  if (req.files?.thumbnail) {
    const thumbLocalPath = req.files?.thumbnail[0]?.path;
    const thumbnail = await uploadOnCloudinary(thumbLocalPath);

    if (thumbnail) categoryId.thumbnail = thumbnail?.url;
  }

  const updatedCategory = await categoryId.save();
  console.log(updatedCategory);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCategory, "Updated category successfully")
    );
});

const deleteAcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw new ApiError(404, "category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category deleted successfully"));
});

const getSingleCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "category with this id not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "single Category fetched"));
});

export {
  createCategory,
  getAllCategoy,
  updateAcategory,
  deleteAcategory,
  getSingleCategory,
};
