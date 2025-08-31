import z from "zod";
import { ReactionSchema, ReactionTypeSchema } from "./reaction";

export const createReactionInputSchema = z.object({
  type: ReactionTypeSchema,
  postId: z.string().optional(),
  commentId: z.string().optional(),
}).refine(data => Boolean(data.postId) !== Boolean(data.commentId), {
  message: "Must specify either postId or commentId, but not both",
});

export const createReactionResponseSchema = ReactionSchema;

export type CreateReactionInput = z.infer<typeof createReactionInputSchema>;
export type CreateReactionResponse = z.infer<typeof createReactionResponseSchema>;