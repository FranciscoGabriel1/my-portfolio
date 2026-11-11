import { expect, test, type Page } from "@playwright/test";

/** Cena 3D do Hero sem WebGL (spec cena-3d-do-hero): a imagem é a versão final. */

test.use({ launchOptions: { args: ["--disable-webgl", "--disable-webgl2"] } });
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

test.describe("sem WebGL", () => {
  test("fica a imagem e nada do Three.js é baixado", async ({ page }) => {
    const watch = watchChunks(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await open(page);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2500);
    await watch.settle();
    expect(await state(page)).toBe("poster");
    expect(watch.chunks.some((c) => c.three)).toBe(false);
    expect(errors).toEqual([]);
    await expect(page.locator(".hero-scene")).toHaveCSS("background-image", /blocks-dark\.webp/);
  });
});

