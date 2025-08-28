import {
  RequestContext,
  NotFoundError,
  BadRequestError,
  prisma,
  env,
} from "../../core";
import { ulid } from "ulid";
import { z } from "zod";
import { sendEmail } from "./utils/send-email";

export const sendVerificationEmailSchema = z.object({
  email: z.string().email(),
});

export type SendVerificationEmailInput = z.infer<
  typeof sendVerificationEmailSchema
>;

export interface SendVerificationEmailResponse {
  message: string;
}

export async function sendVerificationEmail(
  context: RequestContext,
  input: SendVerificationEmailInput
): Promise<SendVerificationEmailResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.emailVerified) {
    throw new BadRequestError("Email already verified");
  }

  // Generate verification code
  const code = ulid();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiry

  // Delete any existing email verification codes for this user
  await prisma.verificationCode.deleteMany({
    where: {
      userId: user.id,
      type: "email_verification",
    },
  });

  // Create new verification code
  await prisma.verificationCode.create({
    data: {
      id: ulid(),
      code,
      type: "email_verification",
      expiresAt,
      userId: user.id,
      email: user.email,
    },
  });

  // Create verification URL
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?code=${code}`;

  // Send verification email
  await sendEmail({
    to: user.email,
    subject: "Verify your email address",
    html: `
      <h2>Email Verification</h2>
      <p>Hi ${user.name || "there"},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a
        href="${verificationUrl}"
        style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
      >Verify Email</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
  });

  return {
    message: "Verification email sent successfully",
  };
}
