import {
  RequestContext,
  BadRequestError,
  requireUserContext,
  prisma,
} from "../../core";
import { z } from "zod";
import { verifyPassword, hashPassword } from "./utils/password";

export const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export interface UpdatePasswordResponse {
  message: string;
}

export async function updatePassword(
  context: RequestContext,
  input: UpdatePasswordInput,
): Promise<UpdatePasswordResponse> {
  requireUserContext(context);

  const user = await prisma.user.findUnique({
    where: { id: context.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  const isValidPassword = await verifyPassword(
    input.currentPassword,
    user.passwordHash,
  );
  if (!isValidPassword) {
    throw new BadRequestError("Current password is incorrect");
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

  return {
    message: "Password updated successfully",
  };
}
