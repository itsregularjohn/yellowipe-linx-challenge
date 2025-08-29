import { PrismaClient } from "../generated/prisma";

const globalWithDb = globalThis as typeof globalThis & {
  testDb: PrismaClient;
};

beforeAll(async () => {
  globalWithDb.testDb = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
      },
    },
  });
});

afterAll(async () => {
  if (globalWithDb.testDb) {
    await globalWithDb.testDb.$disconnect();
  }
});

afterEach(async () => {
  if (globalWithDb.testDb) {
    await globalWithDb.testDb.upload.deleteMany({
      where: {
        user: {
          email: {
            contains: "test",
          },
        },
      },
    });

    await globalWithDb.testDb.verificationCode.deleteMany({
      where: {
        email: {
          contains: "test",
        },
      },
    });

    await globalWithDb.testDb.user.deleteMany({
      where: {
        email: {
          contains: "test",
        },
      },
    });
  }
});
