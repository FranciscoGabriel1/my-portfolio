# CLAUDE.md — Portfólio Francisco Marinho

Portfólio pessoal de desenvolvedor frontend sênior, página única em pt/en/es. Quem lê são recrutadores e líderes técnicos:
o site é a própria prova de competência. Responder e documentar em português do Brasil.

## Comandos

```bash
npm run dev        # http://localhost:3000, redireciona para /pt
npm run lint
npm run build
npm run format     # Prettier com a configuração do projeto (.prettierrc)
npm run translate  # gera en/es a partir de messages/pt.json (DeepL, pede DEEPL_API_KEY)
```

## Ponto de partida (medido em 2026-11-10)

Next.js 14.2 (App Router), React 18, Tailwind v3, framer-motion 11, next-intl, next-themes, react-hook-form + Zod,
lucide-react e Resend. `lint` e `build` passam. A rota `/[locale]` carrega 206 kB de JS.

Lacunas encontradas no ponto de partida (as de acessibilidade e de documentação já foram resolvidas):

- **Qualidade:** sem testes e sem CI. O `package-lock.json` está no `.gitignore`, então o build não é reproduzível.
- **SEO:** sem `sitemap`, `robots`, `hreflang`, canônica ou imagem OG. Os metadados de `app/[locale]/layout.tsx` ficam
  fixos em português em todos os idiomas.
- **Acessibilidade:**
  - textos fixos em português ("Pular para o conteúdo principal", `aria-label` de `Navbar`, `Experience` e `Hero`), embora
    `accessibility.skip_to_content` exista em `messages/`;
  - `--text-muted` não atinge o contraste AA em nenhum tema (cerca de 2,2:1 no claro e 2,7:1 no escuro) e é usado como
    texto em vários lugares;
  - o fundo animado e a troca de cargos do `Hero` ignoram o movimento reduzido: a regra de `globals.css` só alcança CSS, e
    não existe `MotionConfig` global.
- **Formulário de contato (`app/api/contact/route.ts`):** não valida com Zod no servidor, não tem limite de envios e põe o
  que a pessoa digitou direto no HTML do e-mail, sem escapar.
- **Documentação desatualizada:** o `README.md` fala em tradução pela API do Claude (é DeepL), e o `SETUP.md` fala em
  `public/cv.pdf` (o CV são links do Drive em `lib/cv.ts`).

## Estado atual (2026-11-11)

Stack nova (Next 16, React 19, Tailwind 4, Node 24) e identidade "Composição" aplicadas: seções de servidor, sem
framer-motion, tokens AA testados, `aria-*` traduzidos, movimento reduzido e sem JavaScript cobertos por testes de
navegador. Ainda pendente: formulário seguro no servidor, cabeçalhos de segurança e CI (blocos 5 a 7 de
`fundacao-stack-e-qualidade`), SEO e a cena 3D. Otimizações e números em `docs/otimizacao-de-desempenho.md`.

## Direção do upgrade

Nível dos melhores sites do mercado (Awwwards, Linear, Vercel, Apple): animações ligadas à rolagem, 3D em tempo real,
efeitos visuais e acessibilidade de verdade. A stack-alvo, alinhada ao CurrículoRaiz, está em `openspec/config.yaml`.

Regras que não se negociam:

- **Conteúdo primeiro:** o texto é HTML real renderizado no servidor, e o LCP nunca depende de canvas ou WebGL. Sem
  JavaScript, o portfólio continua legível.
- **Todo efeito tem alternativa:** movimento reduzido, falta de WebGL e celular fraco têm comportamento definido. 3D
  entra por import dinâmico, sem SSR, depois do LCP, e pausa fora da tela.
- **Acessibilidade WCAG 2.2 AA:** teclado em tudo, foco visível, contraste e `aria-*` traduzidos. Movimento nunca atrapalha
  a leitura nem sequestra a rolagem.
- **Hidratação sem divergência:** nada de `window`, `document` ou `localStorage` durante a renderização.
- **Biblioteca nova se justifica** pelo custo em KB e pelo que permite. Uma ferramenta por finalidade.

## Convenções

- Conteúdo em `messages/*.json`, nunca no componente. Editar `pt.json` e rodar `npm run translate`.
- Links internos e troca de idioma por `i18n/navigation.ts`.
- Cores por tokens de `app/globals.css`, nunca hex ou rgb no componente. Classes com `cn()` de `lib/utils.ts`.
- Ícones só de `lucide-react`, exceto logos de marca (ex.: `components/ui/DiscordIcon.tsx`).
- Novas telas são avaliadas contra as 10 heurísticas de usabilidade de Nielsen.
- Referências visuais em `inspirations/`: ler antes de desenhar.

## Antes de entregar

`npm run lint`, `npm run build` e conferir no navegador: pt/en/es, claro/escuro, celular e computador, só com teclado,
movimento reduzido e WebGL desligado.

## OpenSpec

Trabalho não trivial passa por uma change antes do código.

- `openspec/specs/<capability>/spec.md`: o que o site faz hoje.
- `openspec/changes/<nome>/`: mudança em andamento (`proposal.md`, `design.md`, `tasks.md` e delta de spec).
- `openspec/changes/archive/`: mudanças concluídas.

```
/opsx:explore  → (opcional) pensar antes de formalizar, sem escrever código
/opsx:propose  → cria a change com todos os artefatos
/opsx:update   → revisa os artefatos de uma change
/opsx:apply    → implementa as tasks
/opsx:sync     → aplica o delta na spec principal
/opsx:archive  → arquiva a change concluída
```

Entregar em partes: um bloco por vez, com status curto, para o dono testar no navegador local antes de seguir.

## Pencil — protótipos visuais (`.pen`)

MCP `pencil`, registrado em `.mcp.json`. Protótipos em `design/prototipos/<nome-do-fluxo>.pen`.

- `.pen` é criptografado: **nunca** abrir com `Read` ou `Grep`, só pelas tools do MCP.
- As tools operam sobre o `.pen` aberto como aba ativa no VS Code. Se não estiver aberto, pedir para abrir.
- Logo depois de inserir ou atualizar nós, os diagnósticos podem vir desatualizados. Confirmar em uma chamada posterior
  antes de tratar como erro.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
