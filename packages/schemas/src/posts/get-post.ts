import z from "zod";
import { PostSchema } from "./post";

export const getPostResponseSchema = PostSchema;

export type GetPostResponse = z.infer<typeof getPostResponseSchema>;