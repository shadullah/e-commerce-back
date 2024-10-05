import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dhbkhhdn2",
  api_key: "729593573772394",
  api_secret: "uL3lev8W3kQyXZm-dWz-HhxJIOo",
  secure: false,
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
    res.status(400).send({ message: "fild uploaded on cloudinary" });
    return response;
  } catch (err) {
    console.log(err);
    // fs.unlinkSync(localFilePath);
    res.status(400).send({ message: "something went wrong on cloudinary" });

    return null;
  }
};

export { uploadOnCloudinary };
