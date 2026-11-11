import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFileName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" },
  },
  // Testa o build de produção, que é o que o visitante recebe.
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/pt`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  // WebGL desligado por padrão: a cena 3D (que no Chromium de teste roda por software e ocupa a CPU) fica de fora
  // dos testes que não são dela. tests/e2e/cena.spec.ts religa o WebGL com `test.use`.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { args: ["--disable-webgl", "--disable-webgl2"] } },
    },
  ],
});
