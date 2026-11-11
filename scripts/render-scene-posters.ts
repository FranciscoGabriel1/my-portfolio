/**
 * Gera as imagens de reserva da cena 3D do Hero a partir da própria cena, para a troca imagem → cena ser
 * imperceptível. Uso (com o site rodando em produção): `npm run build && npx next start -p 3001` e, em outro
 * terminal, `npx tsx scripts/render-scene-posters.ts` (ou `SITE_URL=http://localhost:3100 npx tsx ...`).
 *
 * Saída: public/images/scene/blocks-{dark,light}.webp, com fundo transparente (os nomes ficam, porque a pré-carga
 * e o CSS apontam para eles). O navegador precisa de WebGL; o Chromium do Playwright usa SwiftShader.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3001";
const OUT_DIR = path.join(process.cwd(), "public/images/scene");

async function main() {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const theme of ["dark", "light"] as const) {
    // Mesma largura de coluna do Hero no computador. Escala 1,5 e qualidade 0,7: a imagem é o elemento de LCP,
    // então o peso pesa mais que a nitidez (a 2× e 0,8 ela tinha 59 kB e o LCP subiu de 1,9 para 2,4 s).
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
    await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
    await page.goto(`${SITE_URL}/pt?scene-capture`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector<HTMLElement>(".hero-scene")?.dataset.sceneState === "captured", null, {
      timeout: 120_000,
    });
    await page.waitForTimeout(500);
    const dataUrl = await page.evaluate(() => document.querySelector<HTMLCanvasElement>(".hero-scene canvas")!.toDataURL("image/webp", 0.7));
    const file = path.join(OUT_DIR, `blocks-${theme}.webp`);
    writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
    console.log(`${theme}: ${file} (${Math.round(Buffer.byteLength(dataUrl, "base64") / 1024)} kB aprox.)`);
    await page.close();
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
