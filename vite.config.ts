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
        // Function form (portable across Rollup and vite 8's Rolldown, which no
        // longer accepts the object form). Resolves each module's top-level
        // package name — including its transitive deps — into vendor chunks for
        // long-term caching. The markdown group deliberately captures the whole
        // unified/remark/rehype/micromark/mdast/hast/unist tree so it stays out
        // of the main bundle.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const tail = id.split("node_modules/").pop() ?? "";
          const pkg = tail.startsWith("@")
            ? tail.split("/").slice(0, 2).join("/")
            : (tail.split("/")[0] ?? "");

          if (["react", "react-dom", "react-router", "react-router-dom", "scheduler"].includes(pkg))
            return "react";
          if (pkg.startsWith("@tanstack/")) return "query";
          if (pkg === "radix-ui" || pkg.startsWith("@radix-ui/")) return "radix";
          if (pkg === "sonner") return "sonner";
          if (
            /^(react-markdown|remark|rehype|micromark|mdast|hast|unist|unified|vfile|property-information|hastscript|comma-separated-tokens|space-separated-tokens|web-namespaces|zwitch|bail|trough|devlop|ccount|markdown-table|longest-streak|escape-string-regexp|character-entities|decode-named-character-reference|html-void-elements|is-plain-obj|trim-lines|estree-util|@ungap\/)/.test(
              pkg,
            )
          )
            return "markdown";
          return undefined;
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
