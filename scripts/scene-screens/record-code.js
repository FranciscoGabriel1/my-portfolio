// Grava a tela do notebook da cena 3D: o editor montando a vitrine de projetos (design/prototipos/notebook-codigo).
// Uma passada só (?rec), do quadro "pronto" ao quadro "pronto": o vídeo faz loop sem emenda e o primeiro quadro
// serve de imagem parada. Saída: $SCENE_TMP/video/<arquivo>.webm e cut.json com o trecho a manter.
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('@playwright/test');

(async () => {
  const page = path.join(__dirname, '../../design/prototipos/notebook-codigo/index.html');
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1024, height: 640 }, recordVideo: { dir: process.env.SCENE_TMP + '/video', size: { width: 1024, height: 640 } } });
  const p = await c.newPage();
  const t0 = Date.now();
  await p.goto(pathToFileURL(page).href + '?rec', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => document.title === 'start', null, { timeout: 30000 });
  const startMs = Date.now() - t0;
  await p.waitForFunction(() => document.title === 'done', null, { timeout: 60000 });
  const endMs = Date.now() - t0;
  const video = p.video();
  await c.close();
  const file = await video.path();
  require('fs').writeFileSync(process.env.SCENE_TMP + '/video/cut.json', JSON.stringify({ path: file, startMs, endMs }));
  console.log('vídeo', file, 'trecho', startMs, '→', endMs, 'ms');
  await b.close();
})();
