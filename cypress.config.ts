import { defineConfig } from "cypress";
import { mergeConfig } from "vite";
import viteConfig from "./vite.config";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    video: false,
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: mergeConfig(viteConfig as object, {
        optimizeDeps: {
          include: [
            "react-syntax-highlighter",
            "react-syntax-highlighter/dist/esm/languages/hljs/yaml",
            "react-syntax-highlighter/dist/esm/styles/hljs",
          ],
        },
      }),
    },
    supportFile: "cypress/support/component.ts",
    indexHtmlFile: "cypress/support/component-index.html",
    specPattern: "cypress/component/**/*.cy.tsx",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
  },
});
