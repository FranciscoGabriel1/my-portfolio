import { expect, test, type Page } from "@playwright/test";
import { LOCALES } from "./helpers";

/**
 * Alternativas exigidas pela spec movimento-e-alternativas e pela pagina-inicial:
 * sem JavaScript, com movimento reduzido, só com teclado e sem marcador de rascunho.
 */

const SECTIONS = ["#hero", "#about", "#projects", "#experience", "#contact"];

/** Percorre a página até o fim, para disparar as entradas que esperam a rolagem. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.floor(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 50));
    }
  });
}

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of LOCALES) {
    test(`/${locale} mostra todas as seções, visíveis e com links`, async ({ page }) => {
      await page.goto(`/${locale}`);
      for (const id of SECTIONS) await expect(page.locator(id)).toBeVisible();

      // Nada à espera de animação: tudo com opacidade total e sem deslocamento.
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal] > *")].filter(
          (el) => getComputedStyle(el).opacity !== "1"
        ).length
      );
      expect(hidden).toBe(0);

      // Links internos e externos têm destino real.
      const empty = await page.locator('a:not([href]), a[href="#"], a[href=""]').count();
      expect(empty).toBe(0);
      await expect(page.locator("#projects a[target=_blank]").first()).toHaveAttribute("href", /^https?:\/\//);
    });
  }
});

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("nada fica deslocado, escondido ou em animação depois de carregar", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await scrollThrough(page);

    const moving = await page.evaluate(() => {
      const els = document.querySelectorAll<HTMLElement>(
        "[data-reveal], [data-reveal] > *, .split-word, .ruler-bar"
      );
      return [...els]
        .filter((el) => {
          const style = getComputedStyle(el);
          return style.opacity !== "1" || style.transform !== "none";
        })
        .map((el) => el.className || el.tagName);
    });
    expect(moving).toEqual([]);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
  });
});

test.describe("só com teclado", () => {
  test("um link abaixo da dobra aparece visível ao receber foco", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");

    // Tab até o primeiro link da lista de projetos, que começa abaixo da dobra.
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const inList = await page.evaluate(() => !!document.activeElement?.closest("#projects ol"));
      if (inList) break;
    }
    const focused = page.locator(":focus");
    await expect(focused).toBeInViewport();
    const opacity = await focused.evaluate((el) => getComputedStyle(el.closest("li")!).opacity);
    expect(opacity).toBe("1");
  });

  test("o menu de celular abre e fecha só com teclado", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");

    const button = page.getByRole("button", { name: "Menu" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(":focus")).toHaveText("Sobre");

    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("o formulário abre por teclado e o próximo Tab vai para Nome", async ({ page }) => {
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");

    const summary = page.locator("#contact summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#contact details")).toHaveAttribute("open", "");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Nome")).toBeFocused();
  });
});

test.describe("só informação real", () => {
  for (const locale of LOCALES) {
    test(`/${locale} não tem marcador de rascunho`, async ({ request }) => {
      const html = await (await request.get(`/${locale}`)).text();
      expect(html).not.toMatch(/validar|preencher|lorem/i);
    });
  }
});
