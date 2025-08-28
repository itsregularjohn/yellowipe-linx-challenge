import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  GOOGLE_GMAIL_EMAIL: z.string().email().optional(),
  GOOGLE_APP_PASSWORD: z.string().optional(),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;