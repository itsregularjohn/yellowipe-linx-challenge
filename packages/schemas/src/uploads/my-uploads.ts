import z from "zod";
import { uploadSchema } from "./upload";

export const myUploadsResponseSchema = z.object({
  uploads: z.array(uploadSchema),
});

export type MyUploadsResponse = z.infer<typeof myUploadsResponseSchema>;