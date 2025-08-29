import type { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { env, UnauthorizedError } from "../../core";

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    return await jwt({ secret: env.JWT_SECRET })(c, next);
  } catch (error) {
    throw new UnauthorizedError("Invalid or missing token");
  }
};