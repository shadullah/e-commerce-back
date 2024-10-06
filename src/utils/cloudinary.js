import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dhbkhhdn2",
  api_key: "729593573772394",
  api_secret: "uL3lev8W3kQyXZm-dWz-HhxJIOo",
  // secure: false,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    console.log("uploading photo....");

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "public/img",
    });
    console.log("file is uploaded on cloudinary", response.url);
    console.log(localFilePath);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    console.log("CLOUDINARY :: FILE UPLOAD ERROR ", err);
    return null;
  }
};

export { uploadOnCloudinary };
