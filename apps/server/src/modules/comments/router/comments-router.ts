import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createCommentInputSchema } from "@yellowipe-linx/schemas";
import { getContext } from "../../core";
import { authMiddleware } from "../../auth/middleware";
import {
  createComment,
  getComment,
  getPostComments,
  getCommentReplies,
  deleteComment,
} from "../functions";

const commentsRouter = new Hono();

// Public routes
commentsRouter.get("/post/:postId", async (c) => {
  const context = getContext(c);
  const postId = c.req.param("postId");
  const result = await getPostComments(context, postId);
  return c.json(result);
});

commentsRouter.get("/comment/:commentId", async (c) => {
  const context = getContext(c);
  const commentId = c.req.param("commentId");
  const result = await getCommentReplies(context, commentId);
  return c.json(result);
});

commentsRouter.get("/:id", async (c) => {
  const context = getContext(c);
  const id = c.req.param("id");
  const result = await getComment(context, id);
  return c.json(result);
});

// Protected routes
commentsRouter.post("/", authMiddleware, zValidator("json", createCommentInputSchema), async (c) => {
  const context = getContext(c);
  const input = c.req.valid("json");
  const result = await createComment(context, input);
  return c.json(result, 201);
});

commentsRouter.delete("/:id", authMiddleware, async (c) => {
  const context = getContext(c);
  const id = c.req.param("id");
  await deleteComment(context, id);
  return c.body(null, 204);
});

export { commentsRouter };