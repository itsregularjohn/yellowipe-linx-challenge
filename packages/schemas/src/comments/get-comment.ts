import z from "zod";
import { CommentSchema } from "./comment";

export const getCommentResponseSchema = CommentSchema;

export type GetCommentResponse = z.infer<typeof getCommentResponseSchema>;