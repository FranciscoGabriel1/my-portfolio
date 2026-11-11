import { expect, test, type Page } from "@playwright/test";

/** Transição circular do tema (spec transicao-de-tema). */

async function openDark(page: Page) {
  await page.addInitScript(() => {
    // Só no primeiro carregamento, para o recarregamento poder provar que a escolha ficou guardada.
    if (!window.sessionStorage.getItem("seeded")) {
      window.localStorage.setItem("theme", "dark");
      window.sessionStorage.setItem("seeded", "1");
    }
    // Conta as chamadas à View Transitions API, para saber se a transição foi usada.
    const original = document.startViewTransition?.bind(document);
    (window as unknown as { __vt: number }).__vt = 0;
    if (original) {
      document.startViewTransition = ((cb: () => void) => {
        (window as unknown as { __vt: number }).__vt++;
        return original(cb);
      }) as typeof document.startViewTransition;
    }
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pt");
  await page.waitForLoadState("networkidle");
}

const html = (page: Page) => page.locator("html");
const transitions = (page: Page) => page.evaluate(() => (window as unknown as { __vt: number }).__vt);

test("com movimento reduzido, a troca é instantânea e não usa a transição", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openDark(page);
  await page.getByRole("button", { name: "Mudar para o tema claro" }).click();
  await expect(html(page)).not.toHaveClass(/\bdark\b/);
  expect(await transitions(page)).toBe(0);
});

test("com movimento, a troca usa a transição circular e lembra a escolha", async ({ page }) => {
  await openDark(page);
  await page.getByRole("button", { name: "Mudar para o tema claro" }).click();
  await expect(html(page)).toHaveClass(/\blight\b/);
  expect(await transitions(page)).toBe(1);
  await page.reload();
  await expect(html(page)).toHaveClass(/\blight\b/);
});

test("dois cliques rápidos terminam no tema de partida e a página continua respondendo", async ({ page }) => {
  await openDark(page);
  const button = page.getByRole("button", { name: /Mudar para o tema/ });
  await button.click();
  await button.click({ delay: 0 });
  await page.waitForTimeout(900);
  await expect(html(page)).toHaveClass(/\bdark\b/);
  await expect(page.getByRole("button", { name: "Mudar para o tema claro" })).toBeVisible();
  // Nenhuma camada de transição presa por cima da página: o link do cabeçalho continua clicável.
  await page.getByRole("link", { name: "Projetos" }).first().click();
  await expect(page).toHaveURL(/#projects$/);
});

test("pelo teclado, o foco continua no botão e o rótulo muda", async ({ page }) => {
  await openDark(page);
  const button = page.getByRole("button", { name: "Mudar para o tema claro" });
  await button.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  const after = page.getByRole("button", { name: "Mudar para o tema escuro" });
  await expect(after).toBeFocused();
  await expect(html(page)).toHaveClass(/\blight\b/);
});
