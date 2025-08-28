import { RequestContext, BadRequestError, prisma } from "../../core";
import { z } from "zod";

export const verifyEmailSchema = z.object({
  code: z.string(),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export interface VerifyEmailResponse {
  message: string;
}

export async function verifyEmail(
  context: RequestContext,
  input: VerifyEmailInput
): Promise<VerifyEmailResponse> {
  // Find and validate verification code
  const verificationCode = await prisma.verificationCode.findUnique({
    where: {
      code: input.code,
    },
  });

  if (!verificationCode || verificationCode.type !== "email_verification") {
    throw new BadRequestError("Invalid or expired verification code");
  }

  // Check if code is expired
  if (verificationCode.expiresAt < new Date()) {
    // Delete expired code
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });
    throw new BadRequestError("Invalid or expired verification code");
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: verificationCode.userId },
  });

  if (!user) {
    throw new BadRequestError("User not found");
  }

  if (user.emailVerified) {
    throw new BadRequestError("Email already verified");
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      updatedAt: new Date(),
    },
  });

  // Delete the used verification code
  await prisma.verificationCode.delete({
    where: { id: verificationCode.id },
  });

  return {
    message: "Email verified successfully",
  };
}
