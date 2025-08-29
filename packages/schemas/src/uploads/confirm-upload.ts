import z from "zod";
import { uploadSchema } from "./upload";

export const confirmUploadInputSchema = z.object({
  key: z.string().min(1, "Upload key is required"),
  originalFileName: z.string().min(1, "Original file name is required"),
  fileSize: z.number().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
});

export const confirmUploadResponseSchema = uploadSchema;

export type ConfirmUploadInput = z.infer<typeof confirmUploadInputSchema>;
export type ConfirmUploadResponse = z.infer<typeof confirmUploadResponseSchema>;