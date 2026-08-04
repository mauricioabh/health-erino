import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    pool: "forks",
    maxWorkers: 2,
    env: {
      // neon.ts validates at import; unit tests mock sql and never connect.
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://vitest:vitest@127.0.0.1:5432/vitest",
    },
  },
});
