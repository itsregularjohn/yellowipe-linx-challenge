import z from "zod";

export const deleteCommentResponseSchema = z.object({
  success: z.boolean(),
});

export type DeleteCommentResponse = z.infer<typeof deleteCommentResponseSchema>;