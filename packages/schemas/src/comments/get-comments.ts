import z from "zod";
import { CommentSchema } from "./comment";

export const getCommentsResponseSchema = z.object({
  comments: z.array(CommentSchema),
});

export type CommentsList = z.infer<typeof getCommentsResponseSchema>;