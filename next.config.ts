import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7 (driver adapter) + the `pg` driver must stay external so
  // Turbopack doesn't try to bundle native/dynamic dependencies.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
