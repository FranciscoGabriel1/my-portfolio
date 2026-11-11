import { expect, test } from "@playwright/test";
import { LOCALES } from "./helpers";

// A raiz escolhe o idioma pelo navegador (Accept-Language), com português como padrão.
test.describe("navegador em português", () => {
  test.use({ locale: "pt-BR" });
  test("a raiz redireciona para /pt", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/pt$/);
  });
});

test.describe("navegador em espanhol", () => {
  test.use({ locale: "es-ES" });
  test("a raiz redireciona para /es", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/es$/);
  });
});

for (const locale of LOCALES) {
  test(`/${locale} carrega com o idioma certo e sem erros`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}
