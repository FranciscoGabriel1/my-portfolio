## 1. Organização e limpeza (sem mudar versões)

- [x] 1.1 Mover `app/assets/` para `design/prototipos/` e conferir que os protótipos HTML abrem com imagens e 3D no caminho novo
- [x] 1.2 Remover `package-lock.json` do `.gitignore` e criar `.nvmrc` com a versão maior do Node usada localmente
- [x] 1.3 Remover `lottie-react`, `components/animations/LottiePlayer.tsx` e `@anthropic-ai/sdk`, confirmando que nada os importa
- [x] 1.4 Corrigir o `README.md` (tradução por DeepL) e o `SETUP.md` (CV em `lib/cv.ts`)
- [x] 1.5 Rodar `npm install`, `npm run lint` e `npm run build`; dono confere `/pt`, `/en` e `/es` no navegador local

## 2. Rede de testes na stack atual

- [x] 2.1 Configurar Vitest com jsdom e Testing Library (`vitest.config.mts`, `npm test`)
- [x] 2.2 Escrever o teste de hidratação sem divergência das seções da página
- [x] 2.3 Configurar Playwright contra o build de produção (`npm run test:e2e`), só Chromium
- [x] 2.4 Testes de navegador: `/pt`, `/en` e `/es` carregam com `lang` certo e sem erro no console
- [x] 2.5 Capturas de referência em 1440 e 390 px, claro e escuro, nos três idiomas (base para provar "visualmente idêntico")
- [x] 2.6 Varredura axe WCAG 2.2 A/AA com a lista de exceções nomeada (contraste e `aria-*` fixos), falhando para qualquer violação nova
- [x] 2.7 `npm run lint`, `npm test`, `npm run test:e2e` e `npm run build` passando; dono revisa o relatório do axe

## 3. Next 16, React 19, next-intl 4, ESLint 10 e TypeScript

- [x] 3.1 Migrar para o Next 16 seguindo a documentação empacotada em `node_modules/next/dist/docs` (sem codemod: as mudanças eram poucas): `middleware.ts` virou `proxy.ts`, `params` assíncrono na página e `setRequestLocale` no layout e na página para manter `/pt`, `/en` e `/es` estáticas
- [x] 3.2 Atualizar React, React DOM e tipos para 19, e framer-motion para a versão compatível
- [x] 3.3 Migrar next-intl para a versão 4 seguindo o guia oficial (`i18n/request.ts`, `routing`, navegação) e configurar `timeZone` no servidor (hoje o build de produção registra `ENVIRONMENT_FALLBACK` a cada página)
- [x] 3.4 Trocar `.eslintrc.json` por `eslint.config.mjs` com `eslint-config-next`, mantendo as regras atuais, e ajustar o script `lint`
- [x] 3.5 Fixar o TypeScript na versão mais nova suportada pelo Next 16 e adicionar o script `typecheck`
- [x] 3.6 Atualizar as demais dependências diretas (Zod 4, `@hookform/resolvers`, `next-themes`, `lucide-react`, `resend`, Prettier); `tailwind-merge` e o plugin do Prettier sobem no bloco 4, junto com o Tailwind. O lucide 1.x removeu os ícones de marca: GitHub e LinkedIn viraram `components/ui/BrandIcons.tsx` com o mesmo desenho
- [x] 3.7 Lint, tipos, testes, capturas de referência e build passando (diferença só no desenho das letras e na reamostragem das imagens, até 1,7% dos pixels, aceita); a conferência do dono no navegador foi feita junto com o bloco 4

## 4. Tailwind CSS 4

- [x] 4.1 Rodar `@tailwindcss/upgrade`, levar os tokens de `tailwind.config.ts` para `@theme` em `app/globals.css` e trocar o PostCSS para `@tailwindcss/postcss`
- [x] 4.2 Revisar classes que mudaram de comportamento (borda padrão, sombras, opacidade com `/`) e o plugin do Prettier
- [x] 4.3 Capturas de referência sem diferença perceptível em claro e escuro, 1440 e 390; dono confere no navegador local (conferido pelo dono em 2026-11-11, porta 3000 já no Next 16)

## 5. Formulário de contato seguro

- [ ] 5.1 Criar o schema compartilhado com códigos de erro e testes de cada regra da spec
- [ ] 5.2 Criar `escapeHtml`, a limpeza do assunto e testes (incluindo `<script>` e quebra de linha com `Bcc:`)
- [ ] 5.3 Criar o limitador de envios em memória (5 a cada 10 minutos, `Retry-After`) com testes de janela
- [ ] 5.4 Reescrever `app/api/contact/route.ts`: tipo de conteúdo, tamanho, JSON, campo isca, schema, limite, escape, texto puro, variáveis de ambiente e erros genéricos (400, 413, 415, 429, 502, 503)
- [ ] 5.5 Testes da rota cobrindo todos os cenários da spec `formulario-de-contato`, com o Resend simulado
- [ ] 5.6 Atualizar `Contact.tsx`: schema compartilhado, campo isca fora do teclado e do leitor de tela, mensagens por status
- [ ] 5.7 Adicionar as mensagens novas em `messages/pt.json` e gerar `en`/`es` (`npm run translate` ou revisão manual se não houver chave do DeepL)
- [ ] 5.7a Fazer `scripts/translate.ts` preservar caminhos, URLs e e-mails (o DeepL traduziu `/images/projects/` para `/images/proyectos/` no `es.json`; dado corrigido no bloco 2, causa corrigida aqui) e cobrir com teste
- [ ] 5.8 Teste de componente e de navegador: envio só com teclado, aviso anunciado e erros traduzidos em `/en` e `/es`
- [ ] 5.9 Documentar `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL` no `SETUP.md`; dono testa um envio real no navegador local

## 6. Cabeçalhos de segurança

- [ ] 6.1 Adicionar os cinco cabeçalhos em `next.config` para todas as rotas e `poweredByHeader: false`
- [ ] 6.2 Teste de navegador conferindo os cabeçalhos em `/pt` e na API, e a ausência de `X-Powered-By`

## 7. CI e linha de base

- [ ] 7.1 Criar `.github/workflows/ci.yml` com `npm ci`, lint, tipos, Vitest, build, Playwright e cache
- [ ] 7.2 Configurar Lighthouse CI (perfil celular, 3 execuções, `/pt`, `/en`, `/es`) com asserções em modo aviso
- [ ] 7.3 Registrar neste arquivo a linha de base do Lighthouse (desempenho, acessibilidade, boas práticas, SEO, LCP, CLS, TBT) e das exceções do axe
- [ ] 7.4 Rodar o workflow num branch e confirmar que passa

## 8. Fechamento

- [ ] 8.1 Conferência final em pt/en/es, claro/escuro, celular e computador, só com teclado, com leitor de tela e com movimento reduzido
- [ ] 8.2 `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` e `npm run build` passando
- [ ] 8.3 Atualizar o `CLAUDE.md` (ponto de partida, comandos novos) e rodar `graphify update .`
