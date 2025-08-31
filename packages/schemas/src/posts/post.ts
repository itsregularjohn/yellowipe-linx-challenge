import z from "zod";
import { uploadSchema } from "../uploads/upload";

export const PostSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  content: z.string(),
  uploadId: z.string().nullish(),
  userId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.coerce.date(),
  }),
  upload: uploadSchema.nullish(),
});

export type Post = z.infer<typeof PostSchema>;