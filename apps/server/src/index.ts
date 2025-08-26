import { serve } from "@hono/node-server";
import app from "./app";

const PORT = +process.env.PORT!;

const server = serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`Server is available at http://localhost:${PORT}`);

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
