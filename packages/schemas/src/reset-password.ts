import { z } from 'zod';

export const resetPasswordInputSchema = z.object({
  code: z.string().min(1, 'Reset code is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resetPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;