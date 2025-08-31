import z from "zod";

export const CommentSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  content: z.string(),
  postId: z.string().nullish(),
  commentId: z.string().nullish(),
  userId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.coerce.date(),
  }),
  _count: z.object({
    replies: z.number(),
  }).optional(),
});

export type Comment = z.infer<typeof CommentSchema>;