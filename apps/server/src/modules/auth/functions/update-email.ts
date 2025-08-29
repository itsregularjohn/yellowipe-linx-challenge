import {
  RequestContext,
  ConflictError,
  requireUserContext,
  prisma,
} from "../../core";
import { z } from "zod";

export const updateEmailSchema = z.object({
  newEmail: z.string().email(),
});

export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;

export interface UpdateEmailResponse {
  message: string;
}

export async function updateEmail(
  context: RequestContext,
  input: UpdateEmailInput,
): Promise<UpdateEmailResponse> {
  requireUserContext(context);

  const user = await prisma.user.findUnique({
    where: { id: context.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if new email is already in use by another user
  const existingUser = await prisma.user.findUnique({
    where: { email: input.newEmail },
  });

  if (existingUser && existingUser.id !== user.id) {
    throw new ConflictError("Email already in use");
  }

  // Update user's email and mark as unverified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: input.newEmail,
      emailVerified: false,
      updatedAt: new Date(),
    },
  });

  return {
    message:
      "Email updated successfully. Please verify your new email address.",
  };
}
