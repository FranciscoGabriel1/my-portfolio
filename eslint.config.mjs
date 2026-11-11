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
  {
    // Captura das telas da cena 3D: CommonJS que carrega, em tempo de execução, módulos de outro projeto
    // (CurrículoRaiz). Roda só na máquina de quem regenera as telas, nunca no site.
    files: ["scripts/scene-screens/**"],
    rules: { "@typescript-eslint/no-require-imports": "off", "@typescript-eslint/no-explicit-any": "off" },
  },
]);
