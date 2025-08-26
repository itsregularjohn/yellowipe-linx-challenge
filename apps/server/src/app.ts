import { Hono } from "hono";
import { schema } from "@yellowipe/schemas";
import { PrismaClient } from "./generated/prisma";

const app = new Hono();
const prisma = new PrismaClient();

app.get("/", (c) => {
  const data = schema.parse({ hello: "hello" });

  return c.json(data);
});

app.get("/test/create", async (c) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        passwordHash: "hashedpassword123"
      }
    });
    
    return c.json({ success: true, user });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.get("/test/clean", async (c) => {
  try {
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          contains: "test"
        }
      }
    });
    
    return c.json({ success: true, deletedCount: deletedUsers.count });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
