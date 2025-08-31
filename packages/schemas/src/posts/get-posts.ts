import z from "zod";
import { PostSchema } from "./post";

export const getPostsResponseSchema = z.object({
  posts: z.array(PostSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }),
});

export type PostsList = z.infer<typeof getPostsResponseSchema>;