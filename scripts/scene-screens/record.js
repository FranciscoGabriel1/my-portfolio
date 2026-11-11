// Grava o editor real do CurrículoRaiz em uso (Ada Lovelace, exemplo público; API simulada), com cursor desenhado.
const { chromium } = require('@playwright/test');
const { install } = require('./mock');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'pt-BR', recordVideo: { dir: process.env.SCENE_TMP + '/video', size: { width: 1280, height: 800 } } });
  await install(c);
  await c.addInitScript(() => {
    addEventListener('DOMContentLoaded', () => {
      const cur = document.createElement('div');
      cur.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.6L4 20z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
      Object.assign(cur.style, { position: 'fixed', left: '0', top: '0', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(-3px,-2px)' });
      const ring = document.createElement('div');
      Object.assign(ring.style, { position: 'fixed', width: '34px', height: '34px', margin: '-17px 0 0 -17px', borderRadius: '50%', background: 'rgba(124,58,237,.35)', zIndex: 2147483646, pointerEvents: 'none', opacity: '0', transition: 'opacity .35s, transform .35s', transform: 'scale(.4)' });
      document.body.append(ring, cur);
      addEventListener('mousemove', (e) => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px'; }, true);
      addEventListener('mousedown', () => { ring.style.transition = 'none'; ring.style.opacity = '1'; ring.style.transform = 'scale(.4)'; requestAnimationFrame(() => { ring.style.transition = 'opacity .45s, transform .45s'; ring.style.transform = 'scale(1.2)'; ring.style.opacity = '0'; }); }, true);
    });
  });
  const p = await c.newPage();
  const t0 = Date.now();
  await p.goto((process.env.CR_WEB_URL ?? 'http://127.0.0.1:5180') + '/editor/demo', { waitUntil: 'networkidle' });
  await sleep(1200);
  let pos = { x: 640, y: 400 };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  async function moveTo(x, y, ms = 700) {
    const from = { ...pos }, n = Math.max(8, Math.round(ms / 16));
    for (let i = 1; i <= n; i++) { const k = ease(i / n); await p.mouse.move(from.x + (x - from.x) * k, from.y + (y - from.y) * k); await sleep(16); }
    pos = { x, y };
  }
  async function center(locator) { const r = await locator.boundingBox(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
  async function clickOn(locator, ms) { const c2 = await center(locator); await moveTo(c2.x, c2.y, ms); await sleep(120); await p.mouse.down(); await sleep(90); await p.mouse.up(); }
  await p.mouse.move(pos.x, pos.y);
  const startMs = Date.now() - t0;

  // 1. Recolhe as seções.
  await clickOn(p.getByText('Recolher todas as seções'), 900); await sleep(900);
  // 2. Arrasta "Competências" para cima de "Experiência Profissional".
  const handles = p.locator('[aria-roledescription="sortable"]');
  const comp = await center(handles.nth(3)); const exp = await center(handles.nth(1));
  await moveTo(comp.x, comp.y, 800); await sleep(200); await p.mouse.down(); await sleep(150);
  await moveTo(comp.x + 4, comp.y - 12, 160);
  await moveTo(exp.x + 6, exp.y - 6, 1300); await sleep(350); await p.mouse.up(); await sleep(1300);
  // 3. Abre Dados Pessoais e digita um cargo novo.
  await clickOn(p.getByRole('button', { name: 'Dados Pessoais' }), 800); await sleep(700);
  const cargo = p.getByLabel('Cargo desejado');
  await clickOn(cargo, 700); await sleep(200);
  await p.keyboard.press('Control+A'); await sleep(150);
  await p.keyboard.type('Matemática e Primeira Programadora', { delay: 65 }); await sleep(1100);
  // 4. Catálogo de modelos: Executivo, depois Moderno.
  await clickOn(p.getByRole('button', { name: /Ver modelos/ }), 900); await sleep(1100);
  await clickOn(p.getByText('Executivo', { exact: true }).first(), 900); await sleep(1600);
  await clickOn(p.getByText('Moderno', { exact: true }).first(), 900); await sleep(1800);
  // 5. Fecha o catálogo e para sobre o PDF.
  await p.keyboard.press('Escape'); await sleep(700);
  await moveTo(1186, 28, 1000); await sleep(1400);
  const endMs = Date.now() - t0;
  const video = p.video();
  await c.close();
  const path = await video.path();
  require('fs').writeFileSync(process.env.SCENE_TMP + '/video/cut.json', JSON.stringify({ path, startMs, endMs }));
  console.log('vídeo', path, 'trecho', startMs, '→', endMs, 'ms');
  await b.close();
})();
