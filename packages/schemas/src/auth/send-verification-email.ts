import { z } from 'zod';

export const sendVerificationEmailInputSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const sendVerificationEmailResponseSchema = z.object({
  message: z.string(),
});

export type SendVerificationEmailInput = z.infer<typeof sendVerificationEmailInputSchema>;
export type SendVerificationEmailResponse = z.infer<typeof sendVerificationEmailResponseSchema>;