import z from "zod";

export const ReactionTypeSchema = z.enum(["like", "love", "laugh", "angry", "sad"]);

export const ReactionSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  type: ReactionTypeSchema,
  postId: z.string().nullish(),
  commentId: z.string().nullish(),
  userId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.coerce.date(),
  }),
});

export type ReactionType = z.infer<typeof ReactionTypeSchema>;
export type Reaction = z.infer<typeof ReactionSchema>;