import { Hono } from "hono";
import { schema } from "@yellowipe/schemas";

const app = new Hono();

app.get("/", (c) => {
  const data = schema.parse({ hello: "hello" });

  return c.json(data);
});

export default app;
