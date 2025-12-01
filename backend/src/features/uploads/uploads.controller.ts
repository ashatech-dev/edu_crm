import { IMAGE_SIZES, IMAGE_TYPES_ENUM } from "../../shared/config/constants";
import AppError from "../../shared/utils/AppError";
import { SendResponse } from "../../shared/utils/JsonResponse";

import { NextFunction, Request, Response } from "express";
import sharp from "sharp";
import {
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from "../../shared/utils/cloudinaryService";
import { DeleteImageQuery, UploadImageQuery } from "./uploads.dto";

export async function compressImage(
  file: Express.Multer.File,
  type: IMAGE_TYPES_ENUM
) {
  const config = IMAGE_SIZES[type];

  const buffer = await sharp(file.buffer)
    .resize(config.width, config.height, {
      fit: "cover",
    })
    .toFormat("webp", {
      quality: 80,
    })
    .toBuffer();

  const updatedFile: Express.Multer.File = {
    ...file,
    originalname: file.originalname.replace(/\.\w+$/, ".webp"),
    mimetype: "image/webp",
    buffer,
  };

  return updatedFile;
}

export const uploadImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { type } = req.query as unknown as UploadImageQuery;
    // console.log({ files });

    if (!files || files.length === 0) {
      return next(new AppError("No images provided", 400));
    }

    const uploadedImages = [];

    for (const file of files) {
      const compressedImage = await compressImage(file, type);
      const result = await uploadBufferToCloudinary(
        compressedImage.buffer,
        `wingfi/images/${type}`
      );

      if (!result.success) throw new AppError(result.message, 400);

      uploadedImages.push({
        url: result.data?.url,
        public_id: result.data?.public_id,
      });
    }

    SendResponse(res, {
      message: "Upload successful",
      data: { images: uploadedImages },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return next(new AppError(message, 500));
  }
};

export const deleteImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicId } = req.query as unknown as DeleteImageQuery;
    const result = await deleteFromCloudinary(publicId);

    if (!result.success) throw new AppError(result.message, 400);

    SendResponse(res, {
      message: "Image deleted successfully",
      data: result.message,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Deletion failed";
    return next(new AppError(message, 500));
  }
};
