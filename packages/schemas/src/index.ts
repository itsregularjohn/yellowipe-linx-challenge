import z from "zod";

export const schema = z.object({
  hello: z.string().toUpperCase(),
});

export type Schema = z.infer<typeof schema>;
