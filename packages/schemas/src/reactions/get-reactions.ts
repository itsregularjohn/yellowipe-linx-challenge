import z from "zod";
import { ReactionSchema } from "./reaction";

export const getPostReactionsInputSchema = z.object({
  postId: z.string(),
});

export const getCommentReactionsInputSchema = z.object({
  commentId: z.string(),
});

export const reactionSummarySchema = z.object({
  like: z.number().default(0),
  love: z.number().default(0),
  laugh: z.number().default(0),
  angry: z.number().default(0),
  sad: z.number().default(0),
  total: z.number(),
});

export const getReactionsResponseSchema = z.object({
  reactions: z.array(ReactionSchema),
  summary: reactionSummarySchema,
});

export type GetPostReactionsInput = z.infer<typeof getPostReactionsInputSchema>;
export type GetCommentReactionsInput = z.infer<typeof getCommentReactionsInputSchema>;
export type ReactionSummary = z.infer<typeof reactionSummarySchema>;
export type GetReactionsResponse = z.infer<typeof getReactionsResponseSchema>;