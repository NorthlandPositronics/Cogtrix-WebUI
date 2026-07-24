import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          markdown: ["react-markdown", "remark-gfm", "rehype-raw", "rehype-sanitize"],
          radix: ["radix-ui"],
          sonner: ["sonner"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    // Reset mocks between tests. Several suites share a stubGlobal'd fetch mock
    // and queue responses with mockResolvedValueOnce; without this, an
    // unconsumed queued response leaks into the next test and fails it far from
    // the real cause.
    mockReset: true,
  },
});
