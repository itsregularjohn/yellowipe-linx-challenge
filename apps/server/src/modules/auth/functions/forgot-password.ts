import { RequestContext, prisma, env } from "../../core";
import { ulid } from "ulid";
import {
  ForgotPasswordInput,
  ForgotPasswordResponse,
} from "@yellowipe/schemas";
import { sendEmail } from "./utils/send-email";

export async function forgotPassword(
  context: RequestContext,
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Always return the same message for security (don't reveal if email exists)
  const message =
    "If an account with that email exists, a password reset link has been sent";

  // If user doesn't exist, return message without creating code
  if (!user) {
    return { message };
  }

  // Generate verification code
  const code = ulid();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

  // Delete any existing password reset codes for this user
  await prisma.verificationCode.deleteMany({
    where: {
      userId: user.id,
      type: "password_reset",
    },
  });

  // Create new verification code
  await prisma.verificationCode.create({
    data: {
      id: ulid(),
      code,
      type: "password_reset",
      expiresAt,
      userId: user.id,
      email: user.email,
    },
  });

  // Create reset URL
  const resetUrl = `${env.FRONTEND_URL}/reset-password?code=${code}`;

  // Send password recovery email
  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${user.name || "there"},</p>
      <p>
        You requested to reset your password. Click the link below to set a new
        password:
      </p>
      <a
        href="${resetUrl}"
        style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
      >Reset Password</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `,
  });

  return { message };
}
