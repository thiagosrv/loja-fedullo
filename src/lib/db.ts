import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === "production";

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    // Supabase exige SSL em produção; max:1 evita esgotar conexões no serverless
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
