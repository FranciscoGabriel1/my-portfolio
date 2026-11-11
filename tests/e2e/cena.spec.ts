import { expect, test, type Page } from "@playwright/test";

/**
 * Cena 3D do Hero (spec cena-3d-do-hero). O Chromium de teste desenha WebGL por software (SwiftShader);
 * `__SCENE_TEST__` impede a cena de desistir por lentidão nesse ambiente sem GPU.
 */

test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"] } });
// WebGL por software com a suíte em paralelo: montar a cena pode passar dos 30 s padrão de um teste.
test.describe.configure({ timeout: 90_000 });
const state = (page: Page) => page.locator(".hero-scene").getAttribute("data-scene-state");

/** Registra os pedaços de JS e quando cada um foi pedido, para achar o da cena (o que contém o Three.js). */
function watchChunks(page: Page) {
  const chunks: Array<{ url: string; at: number; three: boolean }> = [];
  const pending: Promise<void>[] = [];
  page.on("response", (res) => {
    if (!res.url().endsWith(".js")) return;
    const at = Date.now();
    pending.push(
      res
        .text()
        .then((body) => void chunks.push({ url: res.url(), at, three: body.includes("WebGLRenderer") }))
        .catch(() => {})
    );
  });
  return { chunks, settle: () => Promise.all(pending) };
}

async function open(page: Page, init?: () => void) {
  await page.addInitScript(() => {
    (window as Window & { __SCENE_TEST__?: boolean }).__SCENE_TEST__ = true;
    window.localStorage.setItem("theme", "dark");
  });
  if (init) await page.addInitScript(init);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pt");
  await page.waitForLoadState("load");
  // A cena começa na primeira interação do visitante (HeroSceneLoader). Como alguém de verdade, o teste segue
  // mexendo o mouse até o carregador reagir (os ouvintes só existem depois da hidratação).
  for (let i = 0; i < 40; i++) {
    await page.mouse.move(400 + (i % 5) * 20, 300 + (i % 3) * 15);
    if (await page.locator(".hero-scene").getAttribute("data-scene-state")) break;
    await page.waitForTimeout(250);
  }
}

test.describe("com WebGL", () => {
  test("a cena aparece, e o Three.js só é pedido depois do carregamento", async ({ page }) => {
    const watch = watchChunks(page);
    let loadAt = 0;
    page.on("load", () => (loadAt = Date.now()));
    await open(page);
    await expect.poll(() => state(page), { timeout: 60_000 }).toBe("running");
    await expect(page.locator(".hero-scene canvas")).toBeVisible();
    await watch.settle();
    const three = watch.chunks.filter((c) => c.three);
    expect(three.length).toBeGreaterThan(0);
    for (const c of three) expect(c.at).toBeGreaterThanOrEqual(loadAt);
  });

  // Com a suíte em paralelo e o WebGL por software, a pausa pode levar alguns segundos para ser observada.
  const SLOW = { timeout: 15_000 };
  test("pausa fora da tela e com a aba oculta, e volta depois", async ({ page }) => {
    await open(page);
    await expect.poll(() => state(page), { timeout: 60_000 }).toBe("running");
    await page.evaluate(() => document.getElementById("projects")!.scrollIntoView({ behavior: "instant" }));
    await expect.poll(() => state(page), SLOW).toBe("paused");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect.poll(() => state(page), SLOW).toBe("running");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect.poll(() => state(page), SLOW).toBe("paused");
  });

  test("ligar o movimento reduzido com a cena rodando devolve a imagem", async ({ page }) => {
    await open(page);
    await expect.poll(() => state(page), { timeout: 60_000 }).toBe("running");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => state(page)).toBe("poster");
    await expect(page.locator(".hero-scene canvas")).toHaveCount(0);
  });

  test("a troca de tema com a cena rodando não derruba a cena", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await open(page);
    await expect.poll(() => state(page), { timeout: 60_000 }).toBe("running");
    await page.getByRole("button", { name: "Mudar para o tema claro" }).click();
    await expect(page.locator("html")).toHaveClass(/\blight\b/);
    await page.waitForTimeout(800);
    expect(await state(page)).toBe("running");
    expect(errors).toEqual([]);
  });

  test("com economia de dados, fica a imagem e nada do Three.js é baixado", async ({ page }) => {
    const watch = watchChunks(page);
    await open(page, () => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2500);
    await watch.settle();
    expect(await state(page)).toBe("poster");
    expect(watch.chunks.some((c) => c.three)).toBe(false);
  });
});

test.describe("movimento reduzido", () => {
  test("fica a imagem e nada do Three.js é baixado", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const watch = watchChunks(page);
    await open(page);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2500);
    await watch.settle();
    expect(await state(page)).toBe("poster");
    expect(watch.chunks.some((c) => c.three)).toBe(false);
  });
});
