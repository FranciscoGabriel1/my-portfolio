## Context

Estado medido em 2026-11-11 (ver proposal.md, "Why"): Next 14.2, React 18, next-intl 3, Tailwind 3, Zod 3, ESLint 8 com `.eslintrc.json`, framer-motion 11 em 11 componentes, `lottie-react` e `@anthropic-ai/sdk` sem uso, lockfile ignorado, nenhum teste, nenhum workflow. Node local 20.20 (o Next 16 exige 20.9 ou mais). Versões estáveis atuais consultadas no npm no mesmo dia: next 16.4, react 19.3, next-intl 4.15, tailwindcss 4.3, zod 4.6, eslint 10.14, vitest 5.1, @playwright/test 1.65, @axe-core/playwright 4.14, @lhci/cli 0.16, typescript 7.0.

Os protótipos HTML ficaram em `app/assets/`, que o lint do Next analisa; os `.js` deles (GSAP, Three.js) não seguem as regras do projeto e quebrariam o lint.

## Goals / Non-Goals

**Goals:**
- Subir a stack sem mudar o que o visitante vê, provando isso com testes de navegador antes e depois.
- Deixar uma rede de segurança que roda sozinha a cada push: lint, tipos, testes, build, axe e Lighthouse.
- Cumprir as specs `formulario-de-contato` e `cabecalhos-de-seguranca`.
- Registrar a linha de base de qualidade (Lighthouse no celular e violações do axe) que as próximas changes vão melhorar.

**Non-Goals:**
- Corrigir as violações de acessibilidade conhecidas, trocar a ferramenta de animação ou mexer em SEO (ver proposal.md, "Fora do escopo").

## Decisions

### 1. Upgrade em blocos, com o que é acoplado no mesmo bloco
Next 16, React 19 e next-intl 4 sobem juntos, porque um depende do outro (App Router, `params` assíncronos, plugin do next-intl). Tailwind 4 sobe num bloco próprio, porque muda só CSS e configuração e é mais fácil comparar visualmente isolado. ESLint 10 entra com o Next 16, já que o `next lint` deixou de existir e a configuração passa para o formato flat (`eslint.config.mjs` com `eslint-config-next`).
- Começar pelos codemods oficiais (`@next/codemod upgrade`, `@tailwindcss/upgrade`) e revisar o diff, em vez de editar à mão.
- Seguir as convenções do Next 16 que o codemod indicar (por exemplo, `middleware.ts` passando a `proxy.ts`, se ainda não estiver feito).
- *Alternativa descartada:* tudo de uma vez. Um erro visual depois de 6 upgrades simultâneos não tem culpado claro.

### 2. TypeScript na versão mais nova que o Next 16 suporta oficialmente
O TypeScript 7 é o compilador nativo novo. Se o plugin de TypeScript do Next 16 e o `typescript-eslint` não o suportarem, fixar a última versão 6.x (ou 5.x) suportada e registrar o motivo no `package.json` da change. *Alternativa descartada:* forçar o 7 e perder a checagem de rotas tipadas do Next.

### 3. framer-motion fica, só atualizado
Os 11 componentes animados continuam com framer-motion, na versão atual compatível com React 19. A troca por GSAP (decisão de direção de arte, com os efeitos aprovados no protótipo B) acontece na change de identidade, que vai reescrever esses componentes de qualquer forma. *Alternativa descartada:* migrar para `motion` agora e para GSAP depois, que mexeria duas vezes nos mesmos arquivos.

### 4. Um schema de contato compartilhado, com códigos em vez de textos
`lib/contact/schema.ts` exporta o schema Zod com as regras da spec e devolve **códigos** de erro (`name_min`, `email_invalid`...). O cliente traduz os códigos com next-intl; o servidor devolve os códigos no JSON do 400. Assim o texto continua em `messages/` e as regras existem em um lugar só.
- *Alternativa descartada:* schema criado dentro do componente com textos traduzidos (como hoje), que impede o servidor de reutilizá-lo.

### 5. Limite de envios em memória, com a limitação documentada
Janela deslizante em memória por origem (primeiro IP de `x-forwarded-for`, depois `x-real-ip`), 5 envios a cada 10 minutos, com `Retry-After`. Em serverless, cada instância tem a própria memória, então o limite é por instância: segura abuso simples, não ataque distribuído. O campo isca cobre robôs comuns.
- *Alternativa considerada:* Redis gerenciado (Upstash). Dá limite global, mas traz um serviço novo, chave nova e custo para um formulário de baixo volume. Fica registrado como evolução se o volume de spam justificar.
- *Complemento sem código:* a regra de limite de requisições da própria hospedagem, se ela oferecer.

### 6. E-mail com escape explícito e versão em texto
Uma função `escapeHtml` pequena e testada (5 caracteres) monta o HTML; o e-mail leva também `text`. O assunto passa por remoção de `\r` e `\n`. Destinatário e remetente vêm de `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL`; sem destinatário, a rota responde 503 (spec). *Alternativa descartada:* React Email: uma dependência a mais para um e-mail de 5 linhas.

### 7. Cabeçalhos pelo `headers()` do `next.config`
Uma regra para `/:path*` aplica os cinco cabeçalhos da spec, e `poweredByHeader: false` remove o `X-Powered-By`. A Content-Security-Policy completa fica para quando entrarem GSAP e Three.js (proposal.md, "Fora do escopo"); por ora, `X-Frame-Options: DENY` cobre o embutimento.

### 8. Pirâmide de testes enxuta
- **Vitest + jsdom + Testing Library:** schema, `escapeHtml`, limitador, rota da API (chamando `POST` com `Request` real e o cliente do Resend simulado) e o componente de contato (fluxo com teclado e mensagens por idioma).
- **Hidratação sem divergência:** renderizar as seções no servidor com `renderToString`, hidratar no jsdom com `hydrateRoot` e falhar se aparecer qualquer aviso de hidratação no console.
- **Playwright + axe** contra o build de produção (`next start`): `/pt`, `/en` e `/es` carregam com `lang` certo, sem erro no console, com os cabeçalhos da spec; formulário com a API interceptada; varredura axe com as regras WCAG 2.2 A e AA.
- As violações de axe que já existem (contraste, `aria-*` em português) entram numa lista de exceções **nomeada e com dono** (a change que vai corrigir cada uma). Qualquer violação nova quebra o CI. A lista só pode diminuir.

### 9. CI no GitHub Actions, Lighthouse primeiro como medida
Um workflow em push e pull request: `npm ci`, lint, `tsc --noEmit`, Vitest, build, Playwright (só Chromium) e Lighthouse CI com o perfil de celular nas três páginas de idioma.
- O Lighthouse começa com asserções em modo aviso: a primeira execução registra a linha de base em `tasks.md`. A partir da change de identidade, as metas viram erro.
- **Orçamento de desempenho**, medido no celular e partindo dos limiares bons do Core Web Vitals: LCP abaixo de 2,5 s, CLS abaixo de 0,1 e TBT abaixo de 200 ms (o laboratório não mede INP; o TBT é o indicador mais próximo).
- Node da CI lido do `.nvmrc` (decisão 10).

### 10. Node 24 LTS
Descoberto na implementação: Vitest 5, jsdom 31, `@testing-library/jest-dom` 7 e `@axe-core/playwright` 4.14 exigem Node 22.12 ou mais novo, e o npm 10 do Node 20 falha ao resolver os peers do Vitest. O Node 20 saiu de suporte em abril de 2026. O projeto passa para o Node 24 LTS (`.nvmrc`), já instalado localmente pelo nvm. *Alternativa descartada:* fixar versões antigas das ferramentas de teste para caber no Node 20, que já não recebe correções de segurança.

### 11. Lockfile versionado e protótipos fora de `app/`
Remover `package-lock.json` do `.gitignore` e commitar o lockfile gerado depois dos upgrades (a CI usa `npm ci`). Mover `app/assets/` para `design/prototipos/` mantém a profundidade de pastas, então os caminhos relativos para `public/` continuam valendo. O `.pen` precisa ser reaberto no VS Code pelo caminho novo.

## Risks / Trade-offs

- [next-intl 4 muda a API de configuração e de `requestLocale`] → seguir o guia de migração oficial e cobrir as três rotas de idioma com Playwright antes de mexer.
- [Tailwind 4 muda detalhes de cor, borda padrão e ordem de utilitários] → comparar capturas em 1440 e 390 px, claro e escuro, antes e depois do bloco; aceitar só diferenças imperceptíveis.
- [React 19 e framer-motion: avisos de `ref` e de tipos] → atualizar framer-motion para a versão que declara suporte ao React 19 e rodar o teste de hidratação.
- [Limite em memória não é global] → documentado na decisão 5; o campo isca e a regra da hospedagem complementam.
- [Lighthouse em CI é ruidoso] → três execuções por página e mediana; asserções só como aviso nesta change.
- [Lista de exceções do axe pode virar esconderijo] → cada exceção tem o nome da change que a remove, e o teste falha se a lista crescer.

## Migration Plan

1. Cada bloco de `tasks.md` termina com lint, build e o site testado no navegador local pelo dono antes do próximo.
2. Antes do bloco de stack, os testes de navegador já existem e passam na stack antiga, servindo de prova de "visualmente idêntico".
3. Variáveis novas (`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) entram no `.env.local` e na hospedagem antes do deploy do bloco de contato.
4. Reversão: cada bloco é um commit isolado; reverter o commit volta o estado anterior, e o lockfile garante as mesmas versões.

## Open Questions

- Onde o site está hospedado hoje (Vercel?) — define se vale configurar também a regra de limite de requisições da hospedagem. Não muda o código desta change.
