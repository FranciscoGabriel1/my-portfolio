import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { KNOWN_VIOLATIONS } from "./a11y-known-violations";
import { LOCALES, openStable, THEMES } from "./helpers";

const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const locale of LOCALES) {
  for (const theme of THEMES) {
    test(`axe WCAG 2.2 AA em /${locale} (${theme})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openStable(page, `/${locale}`, theme);
      const { violations } = await new AxeBuilder({ page })
        .withTags(WCAG_22_AA)
        .analyze();

      const unexpected = violations
        .filter((v) => !(v.id in KNOWN_VIOLATIONS))
        .map(
          (v) =>
            `${v.id} (${v.impact}, ${v.nodes.length} elementos): ${v.help}\n` +
            v.nodes
              .slice(0, 5)
              .map((n) => `    ${n.target.join(" ")} → ${n.failureSummary?.split("\n").slice(1).join(" ").trim()}`)
              .join("\n")
        );

      // Qualquer violação fora da lista conhecida reprova. A lista só pode diminuir.
      expect(unexpected, "violações novas de acessibilidade").toEqual([]);
    });
  }
}
