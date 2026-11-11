import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    // Protótipos, referências e artefatos gerados não fazem parte do app.
    "design/**",
    "inspirations/**",
    "curriculum/**",
    "graphify-out/**",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Ferramentas de linha de comando falam pelo console.
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
]);
