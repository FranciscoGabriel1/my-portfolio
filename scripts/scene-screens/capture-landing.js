// Captura a página pública do CurrículoRaiz em três larguras (sem login, sem dados pessoais).
const { chromium } = require('@playwright/test');
// SCENE_THEME=dark captura o tema escuro (chave `amj-theme` do CurrículoRaiz), em arquivos com `-dark` no nome.
const theme = process.env.SCENE_THEME === 'dark' ? 'dark' : 'light';
(async () => {
  const b = await chromium.launch();
  for (const [name, w, h, maxH] of [['laptop', 1280, 800, 3200], ['tablet', 820, 1180, 3280], ['phone', 390, 844, 2532]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'pt-BR', reducedMotion: 'reduce' });
    await c.addInitScript((t) => localStorage.setItem('amj-theme', JSON.stringify({ state: { theme: t }, version: 0 })), theme);
    const p = await c.newPage();
    await p.goto('https://curriculoraiz.com/', { waitUntil: 'networkidle', timeout: 60000 });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
    await p.waitForTimeout(800);
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.screenshot({ path: `${process.env.SCENE_TMP}/landing-${name}${theme === 'dark' ? '-dark' : ''}.png`, fullPage: true, clip: { x: 0, y: 0, width: w, height: Math.min(maxH, total) } });
    console.log(name, w, 'altura total', total);
    await c.close();
  }
  await b.close();
})();
