import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createPostInputSchema } from "@yellowipe/schemas";
import { getContext } from "../../core";
import { authMiddleware } from "../../auth/middleware";
import {
  createPost,
  getPosts,
  getPost,
  deletePost,
  getUserPosts,
} from "../functions";

const postsRouter = new Hono();

// Public routes
postsRouter.get("/", async (c) => {
  const context = getContext(c);
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const result = await getPosts(context, page, limit);
  return c.json(result);
});

postsRouter.get("/user/:userId", async (c) => {
  const context = getContext(c);
  const userId = c.req.param("userId");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const result = await getUserPosts(context, userId, page, limit);
  return c.json(result);
});

postsRouter.get("/:id", async (c) => {
  const context = getContext(c);
  const id = c.req.param("id");
  const result = await getPost(context, id);
  return c.json(result);
});

// Protected routes
postsRouter.post("/", authMiddleware, zValidator("json", createPostInputSchema), async (c) => {
  const context = getContext(c);
  const input = c.req.valid("json");
  const result = await createPost(context, input);
  return c.json(result, 201);
});


postsRouter.delete("/:id", authMiddleware, async (c) => {
  const context = getContext(c);
  const id = c.req.param("id");
  await deletePost(context, id);
  return c.body(null, 204);
});

export { postsRouter };