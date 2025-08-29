import z from "zod";

export const presignedUrlInputSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().positive("File size must be positive"),
});

export const presignedUrlResponseSchema = z.object({
  uploadUrl: z.string(),
  key: z.string(),
  publicUrl: z.string(),
});

export type PresignedUrlInput = z.infer<typeof presignedUrlInputSchema>;
export type PresignedUrlResponse = z.infer<typeof presignedUrlResponseSchema>;