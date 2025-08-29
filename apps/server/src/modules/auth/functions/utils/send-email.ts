import nodemailer from "nodemailer";
import { z } from "zod";
import { env } from "../../../core/env";
import { HttpError } from "../../../core";

export const sendEmailInputSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
});

export type SendEmailInput = z.infer<typeof sendEmailInputSchema>;

export const sendEmail = async (input: SendEmailInput): Promise<void> => {
  // In testing, just log the email instead of sending
  if (env.NODE_ENV === "test") {
    console.log(`[EMAIL] To: ${input.to}, Subject: ${input.subject}`);
    console.log(`[EMAIL] HTML: ${input.html}`);
    return;
  }

  // In production, require email credentials
  if (!env.GOOGLE_GMAIL_EMAIL || !env.GOOGLE_APP_PASSWORD) {
    throw new HttpError("Email credentials not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.GOOGLE_GMAIL_EMAIL,
      pass: env.GOOGLE_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: env.GOOGLE_GMAIL_EMAIL,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
};
