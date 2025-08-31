import { z } from 'zod';

export const verifyEmailInputSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});

export const verifyEmailResponseSchema = z.object({
  message: z.string(),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;