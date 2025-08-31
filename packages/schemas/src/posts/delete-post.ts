import z from "zod";

export const deletePostResponseSchema = z.object({
  message: z.string(),
});

export type DeletePostResponse = z.infer<typeof deletePostResponseSchema>;