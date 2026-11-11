// API simulada do CurrículoRaiz para gravar o editor com a Ada Lovelace (exemplo público). Nada vai para a API real.
const fs = require('fs');
const ada = JSON.parse(fs.readFileSync(process.env.SCENE_TMP + '/ada.json', 'utf8')).content;
const templates = JSON.parse(fs.readFileSync(process.env.SCENE_TMP + '/templates.json', 'utf8'));
const now = '2026-11-11T12:00:00.000Z';
const sections = ada.sections.map((s, i) => ({ id: 'sec-' + (i + 1), resumeId: 'demo', type: s.type, label: s.label ?? (s.type === 'academic' ? 'Publicações' : ''), data: s.data, createdAt: now, updatedAt: now }));
const resume = { id: 'demo', userId: 'demo', title: 'Ada Lovelace - Clássico', templateId: 'default', templateColor: null, templateFont: null, templateFontSize: null, proTemplateId: null, sectionsOrder: sections.map((s) => s.id), showPhoto: false, photo: null, examplePhotoId: null, createdAt: now, updatedAt: now, sections };
const me = { id: 'demo', firstName: 'Conta', lastName: 'Demo', email: 'demo@exemplo.com', isAdmin: false, plan: 'pro', planExpiresAt: null, hasPassword: true, entitlements: [], shareInviteSeen: true };
async function install(context, log) {
  await context.route('http://localhost:3333/**', async (route) => {
    const req = route.request(); const u = new URL(req.url()); const m = req.method();
    log?.(m + ' ' + u.pathname + (u.pathname === '/client-errors' ? ' :: ' + (req.postData() || '').slice(0, 600) : ''));
    if (u.pathname === '/users/me') return route.fulfill({ json: me });
    if (u.pathname === '/resumes/demo' && m === 'GET') return route.fulfill({ json: resume });
    if (u.pathname === '/resumes/demo' && (m === 'PUT' || m === 'PATCH')) { Object.assign(resume, JSON.parse(req.postData() || '{}')); return route.fulfill({ json: resume }); }
    if (u.pathname.startsWith('/resumes/demo/sections/') && (m === 'PUT' || m === 'PATCH')) {
      const id = u.pathname.split('/').pop(); const s = resume.sections.find((x) => x.id === id); Object.assign(s ?? {}, JSON.parse(req.postData() || '{}'));
      return route.fulfill({ json: s ?? {} });
    }
    if (u.pathname === '/resumes') return route.fulfill({ json: [resume] });
    if (u.pathname === '/resume-tags' || u.pathname === '/resumes/demo/tags') return route.fulfill({ json: [] });
    if (u.pathname === '/premium-features' || u.pathname === '/pro/passes') return route.fulfill({ json: [] });
    if (u.pathname === '/templates') return route.fulfill({ json: templates });
    if (u.pathname === '/subscriptions/current') return route.fulfill({ json: null });
    if (u.pathname === '/features') return route.fulfill({ json: {} });
    return route.fulfill({ json: {} });
  });
  await context.addInitScript((user) => {
    localStorage.setItem('accessToken', 'demo'); localStorage.setItem('refreshToken', 'demo');
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user, accessToken: 'demo', refreshToken: 'demo' }, version: 0 }));
  }, me);
}
module.exports = { install, resume };
