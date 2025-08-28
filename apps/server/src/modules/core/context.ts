import { RequestContext } from './types';
import { UnauthorizedError } from './errors';

export function requireUserContext(context: RequestContext): asserts context is RequestContext & { userId: string } {
  if (!context.userId) {
    throw new UnauthorizedError('User authentication required');
  }
}

export function hasUserContext(context: RequestContext): context is RequestContext & { userId: string } {
  return !!context.userId;
}