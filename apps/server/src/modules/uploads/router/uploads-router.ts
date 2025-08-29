import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  presignedUrlInputSchema,
  confirmUploadInputSchema,
  deleteUploadParamsSchema,
} from "@yellowipe/schemas";
import { getContext } from "../../core";
import { authMiddleware } from "../../auth";
import {
  createPresignedUrl,
  confirmUpload,
  getMyUploads,
  deleteUpload,
} from "../functions";

const uploadsRouter = new Hono();

// Apply auth middleware to all routes
uploadsRouter.use("*", authMiddleware);

uploadsRouter.post(
  "/presigned-url",
  zValidator("json", presignedUrlInputSchema),
  async (c) => {
    const context = getContext(c);
    const input = c.req.valid("json");
    const result = await createPresignedUrl(context, input);
    return c.json(result, 200);
  },
);

uploadsRouter.post(
  "/confirm",
  zValidator("json", confirmUploadInputSchema),
  async (c) => {
    const context = getContext(c);
    const input = c.req.valid("json");
    const result = await confirmUpload(context, input);
    return c.json(result, 201);
  },
);

uploadsRouter.get("/my-uploads", async (c) => {
  const context = getContext(c);
  const result = await getMyUploads(context);
  return c.json(result, 200);
});

// Delete upload
uploadsRouter.delete(
  "/:uploadId",
  zValidator("param", deleteUploadParamsSchema),
  async (c) => {
    const context = getContext(c);
    const { uploadId } = c.req.valid("param");
    const result = await deleteUpload(context, { uploadId });
    return c.json(result, 200);
  },
);

export { uploadsRouter };