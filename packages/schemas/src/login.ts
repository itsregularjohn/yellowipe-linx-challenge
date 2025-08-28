import { z } from 'zod';
import { userSchema } from './user';

export const loginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const loginResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;