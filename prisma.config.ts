import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moves the database URL out of schema.prisma and into this config.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
