import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL (port 5432) pentru migrate/db push — bypass pgbouncer
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
  },
});
