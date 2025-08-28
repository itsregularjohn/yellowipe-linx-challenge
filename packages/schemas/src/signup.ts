import { z } from 'zod';
import { userSchema } from './user';

export const signupInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
export type SignupResponse = z.infer<typeof signupResponseSchema>;