import { User } from "../models/user.model.js";
import { Token } from "../models/token.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const genToken = () => {
  return uuidv4();
};

const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;
    console.log("email : ", email);
    console.log(req.body);

    if (
      [fullname, email, password, role].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "all fields are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }

    console.log(req.files);

    const photoLocalPath = req.files?.photo[0]?.path;

    if (!photoLocalPath) {
      throw new ApiError(400, "Photo file is required");
    }

    let photo;
    try {
      photo = await uploadOnCloudinary(photoLocalPath);
      if (!photo) {
        throw new ApiError(400, "Photo file upload failed.");
      }
    } catch (error) {
      console.error("Cloudinary Upload Error: ", error);
      throw new ApiError(500, "Internal server error during photo upload.");
    }

    const user = await User.create({
      fullname,
      email,
      password,
      role,
      photo: photo?.url,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
    await sendEmail(user.email, "Verify Email", url);

    if (!createdUser) {
      throw new ApiError(500, "Something wrong registering the User");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          createdUser,
          "User email verification sent successfully!!"
        )
      );
  } catch (error) {
    res.status(400).json(new ApiResponse(400, createdUser, "something wrong"));
    console.log(error);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid user credentials");
  }

  if (!user.isVerified) {
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
      const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
      await sendEmail(user.email, "Verify Email", url);
    }

    return res
      .status(400)
      .send({ message: "An Email sent to your account please verify" });
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user_id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  if (!users || users.length === 0) {
    throw new ApiError(404, "Users not found");
  }

  return res.status(200).json(new ApiResponse(200, users, "all users fetched"));
});

const singleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id not exists");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched successfully"));
});

const getToken = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  console.log(user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const token = await Token.findOne({
    userId: user._id,
    token: req.params.token,
  });

  console.log(token);
  if (!token) {
    throw new ApiError(400, "Invalid link");
  }

  await User.updateOne({ _id: user._id }, { isVerified: true });
  await token.deleteOne();

  return res.status(200).send({ message: "email verified" });
  // .json(new ApiResponse(200, _, "Email verified successfully!!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  singleUser,
  getToken,
};
