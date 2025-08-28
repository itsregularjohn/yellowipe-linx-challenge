import { serve } from "@hono/node-server";
import app from "./app";
import { env } from "./modules/core";

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
});

console.log(`Server is available at http://localhost:${env.PORT}`);

process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
