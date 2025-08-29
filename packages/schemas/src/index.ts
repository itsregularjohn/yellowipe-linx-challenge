import z from "zod";

export const schema = z.object({
  hello: z.string().toUpperCase(),
});

export type Schema = z.infer<typeof schema>;

// Auth schemas
export * from './user';
export * from './login';
export * from './signup';
export * from './forgot-password';
export * from './reset-password';
export * from './send-verification-email';
export * from './verify-email';
export * from './update-email';
export * from './update-password';

// Uploads schemas
export * from './uploads';
