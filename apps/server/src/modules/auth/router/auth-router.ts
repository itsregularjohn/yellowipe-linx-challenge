import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import {
  loginInputSchema,
  signupInputSchema,
  forgotPasswordInputSchema,
  resetPasswordInputSchema,
  sendVerificationEmailInputSchema,
  verifyEmailInputSchema,
  updateEmailInputSchema,
  updatePasswordInputSchema,
} from "@yellowipe-linx/schemas";
import { getContext, env, UnauthorizedError } from "../../core";
import { authMiddleware } from "../middleware";
import {
  login,
  signup,
  me,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  updateEmail,
  updatePassword,
} from "../functions";

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

// Password recovery routes
authRouter.post(
  "/forgot-password",
  zValidator("json", forgotPasswordInputSchema),
  async (c) => {
    const context = getContext(c);
    const input = c.req.valid("json");
    const result = await forgotPassword(context, input);
    return c.json(result);
  },
);

authRouter.post(
  "/reset-password",
  zValidator("json", resetPasswordInputSchema),
  async (c) => {
    const context = getContext(c);
    const input = c.req.valid("json");
    const result = await resetPassword(context, input);
    return c.json(result);
  },
);

// Email verification routes
authRouter.post(
  "/send-verification-email",
  zValidator("json", sendVerificationEmailInputSchema),
  async (c) => {
    const context = getContext(c);
    const input = c.req.valid("json");
    const result = await sendVerificationEmail(context, input);
    return c.json(result);
  },
);

authRouter.post(
  "/verify-email",
  zValidator("json", verifyEmailInputSchema),
  async (c) => {
    const context = getContext(c);
    const input = c.req.valid("json");
    const result = await verifyEmail(context, input);
    return c.json(result);
  },
);

// Protected routes requiring authentication

authRouter.use("/update-email", authMiddleware);
authRouter.post(
  "/update-email",
  zValidator("json", updateEmailInputSchema),
  async (c) => {
    const context = getContext(c);
    const input = c.req.valid("json");
    const result = await updateEmail(context, input);
    return c.json(result);
  },
);

authRouter.use("/update-password", authMiddleware);
authRouter.post(
  "/update-password",
  zValidator("json", updatePasswordInputSchema),
  async (c) => {
    const context = getContext(c);
    const input = c.req.valid("json");
    const result = await updatePassword(context, input);
    return c.json(result);
  },
);

export { authRouter };
