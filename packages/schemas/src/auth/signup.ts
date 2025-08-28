import z from "zod";
import { userSchema } from "./user";

export const signupInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const signupResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
export type SignupResponse = z.infer<typeof signupResponseSchema>;