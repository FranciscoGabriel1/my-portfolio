import type { Page } from "@playwright/test";

export const LOCALES = ["pt", "en", "es"] as const;
export const THEMES = ["dark", "light"] as const;

/**
 * Abre a página num estado estável: tema escolhido, movimento reduzido, fontes carregadas
 * e a página inteira percorrida, para que as entradas que esperam a rolagem já tenham acontecido.
 */
export async function openStable(page: Page, path: string, theme: (typeof THEMES)[number]) {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
  await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.6));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  // Espera o texto do Hero parar de mudar (rede de segurança contra qualquer animação de texto).
  await page.evaluate(async () => {
    const read = () => document.querySelector("#hero")?.textContent ?? "";
    const deadline = Date.now() + 15_000;
    let previous = read();
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 700));
      const current = read();
      if (current === previous) return;
      previous = current;
    }
  });
}
