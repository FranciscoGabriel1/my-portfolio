import { expect, test } from "@playwright/test";
import { LOCALES, openStable, THEMES } from "./helpers";

/**
 * Capturas de referência da página inteira. Servem para provar que um upgrade de stack
 * não mudou o que o visitante vê. Atualizar só de propósito: `npm run test:e2e:update`.
 */
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const vp of VIEWPORTS) {
  for (const locale of LOCALES) {
    for (const theme of THEMES) {
      test(`${locale} ${theme} ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await openStable(page, `/${locale}`, theme);
        await expect(page).toHaveScreenshot(`${locale}-${theme}-${vp.name}.png`, {
          fullPage: true,
          stylePath: "tests/e2e/screenshot.css",
        });
      });
    }
  }
}
