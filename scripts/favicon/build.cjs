// Gera app/apple-icon.png (180 × 180) a partir de app/icon.svg: o iOS arredonda os cantos sozinho, então o ícone
// sai sem o arredondamento e sem a borda, ocupando o quadrado inteiro. Uso: node scripts/favicon/build.cjs
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { chromium } = require("@playwright/test");

const root = join(__dirname, "..", "..");
const svg = readFileSync(join(root, "app/icon.svg"), "utf8")
  .replace(/<rect x="0\.75"[^>]*\/>\s*/, "")
  .replace(/ rx="15"/g, "");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:180px;height:180px}</style>${svg}`);
  await page.screenshot({ path: join(root, "app/apple-icon.png"), omitBackground: false });
  await browser.close();
  console.log("app/apple-icon.png gerado");
})();
