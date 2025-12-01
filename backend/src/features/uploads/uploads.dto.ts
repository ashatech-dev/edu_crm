import { z } from "zod";
import { IMAGE_TYPES_ENUM } from "../../shared/config/constants";

export const uploadImageQuerySchema = z.object({
  type: z.enum(IMAGE_TYPES_ENUM).refine(v => Object.values(IMAGE_TYPES_ENUM).includes(v as IMAGE_TYPES_ENUM), {
    message: "Invalid image type provided"
  })
});

export const deleteImageQuerySchema = z.object({
  publicId: z.string().refine((v) => v !== undefined && v !== null, { message: "Image publicId is required" }).min(1, "Image publicId cannot be empty"),
});

export type UploadImageQuery = z.infer<typeof uploadImageQuerySchema>;
export type DeleteImageQuery = z.infer<typeof deleteImageQuerySchema>;