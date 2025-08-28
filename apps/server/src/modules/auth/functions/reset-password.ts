import { RequestContext, BadRequestError, prisma } from "../../core";
import { z } from "zod";
import { hashPassword } from "./utils/password";

export const resetPasswordSchema = z.object({
  code: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordResponse {
  message: string;
}

export async function resetPassword(
  context: RequestContext,
  input: ResetPasswordInput
): Promise<ResetPasswordResponse> {
  // Find and validate verification code
  const verificationCode = await prisma.verificationCode.findUnique({
    where: {
      code: input.code,
    },
  });

  if (!verificationCode || verificationCode.type !== "password_reset") {
    throw new BadRequestError("Invalid or expired reset code");
  }

  // Check if code is expired
  if (verificationCode.expiresAt < new Date()) {
    // Delete expired code
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });
    throw new BadRequestError("Invalid or expired reset code");
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: verificationCode.userId },
  });

  if (!user) {
    throw new BadRequestError("User not found");
  }

  // Hash the new password
  const hashedPassword = await hashPassword(input.newPassword);

  // Update user's password
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      updatedAt: new Date(),
    },
  });

  // Delete the used verification code
  await prisma.verificationCode.delete({
    where: { id: verificationCode.id },
  });

  return {
    message: "Password reset successfully",
  };
}
