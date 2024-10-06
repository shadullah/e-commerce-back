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

    // clean up the local file
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    console.log("CLOUDINARY :: FILE UPLOAD ERROR ", err);

    // attemp to clean up the file in case of error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export { uploadOnCloudinary };
