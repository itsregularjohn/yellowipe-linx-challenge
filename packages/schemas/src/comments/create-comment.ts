import z from "zod";
import { CommentSchema } from "./comment";

export const createCommentInputSchema = z.object({
  content: z.string().min(1),
  postId: z.string().optional(),
  commentId: z.string().optional(),
}).refine(data => Boolean(data.postId) !== Boolean(data.commentId), {
  message: "Must specify either postId or commentId, but not both",
});

export const createCommentResponseSchema = CommentSchema;

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
export type CreateCommentResponse = z.infer<typeof createCommentResponseSchema>;