// Renderiza o painel admin real do CurrículoRaiz (dev local) com a API simulada e DADOS DE DEMONSTRAÇÃO.
// Nada aqui vem da API ou do banco de verdade; nomes e e-mails são fictícios (domínio exemplo.com).
const { chromium } = require('@playwright/test');
const days = 30, today = new Date('2026-11-11T12:00:00Z');
const daily = Array.from({ length: days }, (_, i) => {
  const d = new Date(today); d.setUTCDate(d.getUTCDate() - (days - 1 - i));
  const s = Math.round(18 + 10 * Math.sin(i / 3.2) + i * 0.9 + (i % 4) * 2);
  return { date: d.toISOString().slice(0, 10), signups: s, exports: Math.round(s * 1.35 + (i % 5)) };
});
const sum = (k) => daily.reduce((a, d) => a + d[k], 0);
const overview = {
  period: { days, from: daily[0].date, to: daily[days - 1].date },
  kpis: {
    signups: { value: sum('signups'), previous: Math.round(sum('signups') * 0.82), series: daily.slice(-12).map((d) => d.signups) },
    activation: { value: 0.46, previous: 0.41 },
    exports: { value: sum('exports'), previous: Math.round(sum('exports') * 0.77), series: daily.slice(-12).map((d) => d.exports) },
    proActive: { value: 128 },
    revenue: { value: 418900, previous: 352000, sales: 97 },
    waitlist: { value: 34, previous: 21, total: 212 },
  },
  daily,
  funnel: { signups: sum('signups'), created: Math.round(sum('signups') * 0.71), exported: Math.round(sum('signups') * 0.46), pro: Math.round(sum('signups') * 0.11) },
  signupSources: [
    { source: 'google', campaign: null, signups: 412, activated: 203, buyers: 48, revenueCents: 211000 },
    { source: 'linkedin', campaign: 'demo', signups: 188, activated: 91, buyers: 22, revenueCents: 96800 },
    { source: 'direct', campaign: null, signups: 133, activated: 57, buyers: 14, revenueCents: 61600 },
  ],
  exportsByTemplate: [{ template: 'default', count: 612 }, { template: 'executive', count: 341 }, { template: 'modern', count: 207 }, { template: 'elegant', count: 98 }],
  exportsByFormat: [{ format: 'pdf', count: 1004 }, { format: 'docx', count: 254 }],
  waitlist: { total: 212, ranking: [{ feature: 'ai-review', name: 'Revisão com IA', count: 96 }, { feature: 'cover-letter', name: 'Carta de apresentação', count: 71 }], bySource: [] },
  recentSignups: [
    { id: 'd1', name: 'Conta Demo Um', email: 'demo1@exemplo.com', plan: 'pro', createdAt: new Date(Date.now() - 6e5).toISOString() },
    { id: 'd2', name: 'Conta Demo Dois', email: 'demo2@exemplo.com', plan: 'free', createdAt: new Date(Date.now() - 2.4e6).toISOString() },
    { id: 'd3', name: 'Conta Demo Três', email: 'demo3@exemplo.com', plan: 'free', createdAt: new Date(Date.now() - 7.2e6).toISOString() },
  ],
};
const me = { id: 'demo', firstName: 'Conta', lastName: 'Demo', email: 'demo@exemplo.com', isAdmin: true, plan: 'pro', planExpiresAt: null, hasPassword: true, entitlements: [] };
(async () => {
  const theme = process.argv[2] || 'dark';
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'pt-BR', colorScheme: theme, reducedMotion: 'reduce' });
  const unknown = new Set();
  await c.route('http://localhost:3333/**', (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/users/me') return route.fulfill({ json: me });
    if (u.pathname === '/admin/overview') return route.fulfill({ json: overview });
    unknown.add(u.pathname);
    return route.fulfill({ json: {} });
  });
  await c.addInitScript(([user, t]) => {
    // Tema do CurrículoRaiz (o app usa a própria chave, não o tema do sistema).
    localStorage.setItem('amj-theme', JSON.stringify({ state: { theme: t }, version: 0 }));
    localStorage.setItem('accessToken', 'demo'); localStorage.setItem('refreshToken', 'demo');
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user, accessToken: 'demo', refreshToken: 'demo' }, version: 0 }));
  }, [me, theme]);
  const p = await c.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto((process.env.CR_WEB_URL ?? 'http://127.0.0.1:5180') + '/admin', { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(2500);
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.screenshot({ path: `${process.env.SCENE_TMP}/admin-${theme}.png`, fullPage: true });
  console.log(theme, 'url', p.url(), 'altura', total, 'outros endpoints', [...unknown].join(','), 'erros', errs.slice(0, 3).join(' | '));
  await b.close();
})();
