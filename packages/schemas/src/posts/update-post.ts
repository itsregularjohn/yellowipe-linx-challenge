import z from "zod";
import { PostSchema } from "./post";

export const updatePostInputSchema = z.object({
  content: z.string().min(1).optional(),
});

export const updatePostResponseSchema = PostSchema;

export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
export type UpdatePostResponse = z.infer<typeof updatePostResponseSchema>;