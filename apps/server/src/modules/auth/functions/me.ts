import { User } from '@yellowipe/schemas';
import { RequestContext, requireUserContext, prisma } from '../../core';

export async function me(context: RequestContext): Promise<User> {
  requireUserContext(context);

  const user = await prisma.user.findUnique({
    where: { id: context.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    createdAt: user.createdAt,
    name: user.name,
    email: user.email,
  };
}