import { SignupInput, SignupResponse } from "@yellowipe-linx/schemas";
import { RequestContext, ConflictError, prisma } from "../../core";
import { hashPassword } from "./utils/password";
import { generateToken } from "./utils/jwt";

export async function signup(
  context: RequestContext,
  input: SignupInput,
): Promise<SignupResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword,
    },
  });

  const publicUser = {
    id: user.id,
    createdAt: user.createdAt,
    name: user.name,
    email: user.email,
  };

  const token = generateToken(publicUser);

  return {
    user: publicUser,
    token,
  };
}
