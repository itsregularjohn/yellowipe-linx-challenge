import z from "zod";

export const deleteReactionInputSchema = z.object({
  id: z.string(),
});

export const deletePostReactionInputSchema = z.object({
  postId: z.string(),
});

export const deleteCommentReactionInputSchema = z.object({
  commentId: z.string(),
});

export type DeleteReactionInput = z.infer<typeof deleteReactionInputSchema>;
export type DeletePostReactionInput = z.infer<typeof deletePostReactionInputSchema>;
export type DeleteCommentReactionInput = z.infer<typeof deleteCommentReactionInputSchema>;