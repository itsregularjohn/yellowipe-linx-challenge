import { z } from 'zod';

export const updateEmailInputSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
});

export const updateEmailResponseSchema = z.object({
  message: z.string(),
});

export type UpdateEmailInput = z.infer<typeof updateEmailInputSchema>;
export type UpdateEmailResponse = z.infer<typeof updateEmailResponseSchema>;