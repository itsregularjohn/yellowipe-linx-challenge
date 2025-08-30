import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { logger } from "hono/logger";
import { authRouter } from "./modules/auth";
import { uploadsRouter } from "./modules/uploads";
import { HttpError } from "./modules/core/errors";
import { ContentfulStatusCode } from "hono/utils/http-status";

const app = new Hono();
app.use(cors());
app.use(logger());

app.use("*", requestId());

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json(
      { error: err.message },
      err.statusCode as ContentfulStatusCode
    );
  }

  return c.json({ error: "Internal server error" }, 500);
});

app.route("/v1/auth", authRouter);
app.route("/v1/uploads", uploadsRouter);

export default app;
