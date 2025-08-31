import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createReactionInputSchema } from "@yellowipe-linx/schemas";
import { getContext } from "../../core";
import { authMiddleware } from "../../auth/middleware";
import {
  createReaction,
  getPostReactions,
  getCommentReactions,
  deleteReaction,
  deletePostReaction,
  deleteCommentReaction,
} from "../functions";

const reactionsRouter = new Hono();

// Public routes - Get reactions
reactionsRouter.get("/posts/:postId", async (c) => {
  const context = getContext(c);
  const postId = c.req.param("postId");
  const result = await getPostReactions(context, { postId });
  return c.json(result);
});

reactionsRouter.get("/comments/:commentId", async (c) => {
  const context = getContext(c);
  const commentId = c.req.param("commentId");
  const result = await getCommentReactions(context, { commentId });
  return c.json(result);
});

// Protected routes
reactionsRouter.post("/", authMiddleware, zValidator("json", createReactionInputSchema), async (c) => {
  const context = getContext(c);
  const input = c.req.valid("json");
  const result = await createReaction(context, input);
  return c.json(result, 201);
});

reactionsRouter.delete("/:id", authMiddleware, async (c) => {
  const context = getContext(c);
  const id = c.req.param("id");
  await deleteReaction(context, { id });
  return c.body(null, 204);
});

reactionsRouter.delete("/posts/:postId", authMiddleware, async (c) => {
  const context = getContext(c);
  const postId = c.req.param("postId");
  await deletePostReaction(context, { postId });
  return c.body(null, 204);
});

reactionsRouter.delete("/comments/:commentId", authMiddleware, async (c) => {
  const context = getContext(c);
  const commentId = c.req.param("commentId");
  await deleteCommentReaction(context, { commentId });
  return c.body(null, 204);
});

export { reactionsRouter };