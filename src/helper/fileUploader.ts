import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ICloudinaryResponse } from "../app/interfaces/file";

cloudinary.config({
  cloud_name: "dfcmsfwh5",
  api_key: "816658979623364",
  api_secret: "uKw6NRf1O8S2cF3pZk6wcbr7Ctg",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<ICloudinaryResponse> => {
  return new Promise<ICloudinaryResponse>((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      {
        public_id: file.originalname,
        folder: "Health_Care",
        resource_type: "auto",
        transformation: { width: 500, height: 500, crop: "limit" },
      },
      (error, result) => {
        fs.unlinkSync(file.path);
        if (error) {
          reject(error);
        } else {
          resolve(result as ICloudinaryResponse | any);
        }
      }
    );
  });
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
