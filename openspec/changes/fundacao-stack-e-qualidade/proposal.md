## Why

O portfólio vai passar por um redesenho grande (3D, animações ligadas à rolagem, páginas novas), mas hoje não tem testes, CI nem lockfile versionado, roda numa stack dois anos atrás da atual e tem um formulário de contato inseguro: o servidor não valida o que recebe, não limita envios e coloca o texto digitado direto no HTML do e-mail. Sem essa base, cada mudança visual vira um risco sem rede, e o próprio site contradiz a competência que ele quer provar.

## What Changes

- Atualizar a stack para as versões estáveis atuais: Next.js 16, React 19, next-intl 4, Tailwind CSS 4, Zod 4, ESLint 10 (configuração flat) e as demais dependências diretas. **BREAKING** para quem desenvolve: muda a configuração do Tailwind (CSS-first) e do ESLint; para o visitante, o site fica visualmente idêntico.
- Versionar o `package-lock.json` (hoje ignorado no `.gitignore`), para o build ser reproduzível.
- Remover dependências sem uso (`lottie-react` e o componente `LottiePlayer`, `@anthropic-ai/sdk`).
- Mover os protótipos de `app/assets/` para `design/prototipos/`, a pasta definida no `CLAUDE.md`, para que o lint e o build do Next não analisem arquivos de protótipo.
- Criar testes: Vitest com React Testing Library (unidade e componentes), teste de hidratação sem divergência e Playwright com axe para as páginas em pt, en e es.
- Criar CI no GitHub Actions: lint, checagem de tipos, testes, build, testes de navegador com axe e Lighthouse CI no perfil de celular. A primeira execução registra a linha de base de desempenho, acessibilidade, SEO e boas práticas.
- Tornar o formulário de contato seguro: validação com o mesmo schema Zod no cliente e no servidor, limite de envios por origem, campo isca contra robôs, conteúdo escapado no e-mail, limites de tamanho, erros genéricos para o visitante e destinatário vindo de variável de ambiente.
- Adicionar cabeçalhos de segurança HTTP em todas as respostas.
- Corrigir a documentação: o `README.md` cita tradução pela API do Claude (é DeepL) e o `SETUP.md` cita `public/cv.pdf` (o CV são links em `lib/cv.ts`).

O que o visitante percebe: nada muda na aparência. O formulário passa a responder de forma clara quando a mensagem é inválida ou quando há envios demais, e um e-mail com código no nome chega como texto, sem executar nada.

## Fora do escopo

- Qualquer mudança visual, de identidade, de conteúdo ou de animação (vão para as changes de identidade, Hero e seções, com protótipo no Pencil ou HTML antes).
- Corrigir as violações de acessibilidade já conhecidas (contraste de `--text-muted`, textos de `aria-*` fixos em português): a fundação passa a **medir** essas violações e registrá-las como linha de base; a correção vem na change de conteúdo no servidor e na de identidade.
- SEO (`sitemap`, `robots`, `hreflang`, metadados por idioma, imagem OG, JSON-LD) fica para a change de conteúdo no servidor e SEO.
- Trocar framer-motion por GSAP: a decisão de ferramenta de animação acontece na change de identidade, junto com os efeitos novos.
- Content-Security-Policy completa: entra quando houver os scripts de 3D e de animação, para não ser escrita duas vezes.

## Capabilities

### New Capabilities
- `formulario-de-contato`: como o servidor recebe, valida, limita e entrega as mensagens enviadas pelo formulário de contato, e como o visitante é informado do resultado.
- `cabecalhos-de-seguranca`: cabeçalhos HTTP de segurança presentes em todas as respostas do site.

### Modified Capabilities

(nenhuma: ainda não há specs em `openspec/specs/`)

## Impact

- **Dependências:** praticamente todas as diretas sobem de versão maior; saem `lottie-react` e `@anthropic-ai/sdk`; entram Vitest, Testing Library, jsdom, Playwright, axe e Lighthouse CI como dependências de desenvolvimento.
- **Configuração:** `tailwind.config.ts` vira `@theme` em `app/globals.css`; `.eslintrc.json` vira `eslint.config.mjs`; `next.config.mjs` ganha os cabeçalhos; `postcss.config.mjs` passa a usar `@tailwindcss/postcss`; `.gitignore` deixa de ignorar o lockfile.
- **Código:** `app/[locale]/layout.tsx` e `app/[locale]/page.tsx` (parâmetros assíncronos do Next 16), `middleware.ts` (convenção do Next 16), `i18n/*` (next-intl 4), `app/api/contact/route.ts` e `components/sections/Contact.tsx` (schema compartilhado em `lib/`), componentes com framer-motion (compatibilidade com React 19).
- **Mensagens:** chaves novas de erro do formulário em `messages/pt.json`, `en.json` e `es.json`.
- **Infra:** variáveis de ambiente novas (`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`), workflow em `.github/workflows/`.
- **Arquivos:** `app/assets/` passa para `design/prototipos/`.
