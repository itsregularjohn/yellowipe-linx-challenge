import z from "zod";
import { userSchema } from "../auth/user";

export const uploadSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  key: z.string(),
  originalFileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  publicUrl: z.string(),
  userId: z.string(),
  user: userSchema,
});

export type Upload = z.infer<typeof uploadSchema>;