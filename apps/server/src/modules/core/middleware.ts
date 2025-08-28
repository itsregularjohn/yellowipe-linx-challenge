import { Context } from 'hono';
import { RequestContext } from './types';

export function getContext(c: Context): RequestContext {
  const requestId = c.get('requestId');
  const jwtPayload = c.get('jwtPayload');
  
  return {
    requestId,
    userId: jwtPayload?.sub,
  };
}