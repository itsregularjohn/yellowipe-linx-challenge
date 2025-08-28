import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { loginInputSchema, signupInputSchema } from "@yellowipe/schemas";
import { getContext, env, UnauthorizedError } from "../../core";
import { login, signup, me } from "../functions";

const authRouter = new Hono();

authRouter.post("/login", zValidator("json", loginInputSchema), async (c) => {
  const context = getContext(c);
  const input = c.req.valid("json");
  const result = await login(context, input);
  return c.json(result);
});

authRouter.post("/signup", zValidator("json", signupInputSchema), async (c) => {
  const context = getContext(c);
  const input = c.req.valid("json");
  const result = await signup(context, input);
  return c.json(result, 201);
});

authRouter.use("/me", async (c, next) => {
  try {
    return await jwt({ secret: env.JWT_SECRET })(c, next);
  } catch (error) {
    throw new UnauthorizedError("Invalid or missing token");
  }
});

authRouter.get("/me", async (c) => {
  const context = getContext(c);
  const result = await me(context);
  return c.json(result);
});

export { authRouter };
