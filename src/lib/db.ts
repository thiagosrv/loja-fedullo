import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Fail loud so Vercel logs show the real cause
if (!process.env.DATABASE_URL) {
  throw new Error(
    "[db] DATABASE_URL environment variable is not set. " +
    "Add it in Vercel → Settings → Environment Variables."
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === "production";

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    // Supabase requires SSL in production; max:1 avoids exhausting connections in serverless
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: isProduction ? 1 : 5,
  });

  return new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["error", "warn"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
