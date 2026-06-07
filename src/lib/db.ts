import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function initSync(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const tursoUrl = process.env.TURSO_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  let client: PrismaClient;

  if (tursoUrl && tursoToken) {
    // Production: use Turso / libSQL
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
    client = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  } else {
    // Local dev fallback: SQLite via better-sqlite3
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pathMod = require("path");
    const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
    const dbPath = dbUrl.startsWith("file:./")
      ? pathMod.join(process.cwd(), dbUrl.slice("file:./".length))
      : dbUrl.slice("file:".length);
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    client = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  } else {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = initSync();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
