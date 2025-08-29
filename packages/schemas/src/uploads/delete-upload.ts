import z from "zod";

export const deleteUploadParamsSchema = z.object({
  uploadId: z.string().min(1, "Upload ID is required"),
});

export const deleteUploadResponseSchema = z.object({
  message: z.string(),
});

export type DeleteUploadParams = z.infer<typeof deleteUploadParamsSchema>;
export type DeleteUploadResponse = z.infer<typeof deleteUploadResponseSchema>;