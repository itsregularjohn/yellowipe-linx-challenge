import { LoginInput, LoginResponse } from '@yellowipe/schemas';
import { RequestContext, UnauthorizedError, prisma } from '../../core';
import { verifyPassword } from './utils/password';
import { generateToken } from './utils/jwt';

export async function login(
  context: RequestContext,
  input: LoginInput
): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

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