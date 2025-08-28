import { z } from 'zod';

export const updatePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updatePasswordResponseSchema = z.object({
  message: z.string(),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordInputSchema>;
export type UpdatePasswordResponse = z.infer<typeof updatePasswordResponseSchema>;