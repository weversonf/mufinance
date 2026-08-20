import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
