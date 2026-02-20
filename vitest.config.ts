import { fileURLToPath } from "node:url";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: true
  }
});
