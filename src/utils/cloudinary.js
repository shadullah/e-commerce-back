import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dhbkhhdn2",
  api_key: "729593573772394",
  api_secret: "uL3lev8W3kQyXZm-dWz-HhxJIOo",
  secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file is uploaded on cloudinary", response.url);
    console.log(localFilePath);
    // fs.unlinkSync(localFilePath);

    return response;
  } catch (err) {
    console.log(err);
    // fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
