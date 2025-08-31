import z from "zod";
import { PostSchema } from "./post";

export const createPostInputSchema = z.object({
  content: z.string().min(1),
  uploadId: z.string().optional(),
});

export const createPostResponseSchema = PostSchema;

export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type CreatePostResponse = z.infer<typeof createPostResponseSchema>;