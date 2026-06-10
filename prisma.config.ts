import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DATABASE_URL_DIRECT for migrations (bypasses pgBouncer).
    // Falls back to DATABASE_URL when direct URL is not set.
    url: process.env["DATABASE_URL_DIRECT"] ?? process.env["DATABASE_URL"] ?? "",
  },
});
