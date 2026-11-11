## Why

As competências no Sobre eram quatro listas de texto, sem destaque e sem as tecnologias que o dono usou no CurrículoRaiz, seu produto em produção. Em 2026-11-11 ele pediu uma seção mais elegante, com logotipos e animações, que inclua a infraestrutura e as integrações do CurrículoRaiz e as ferramentas de IA usadas para construí-lo. O protótipo `design/prototipos/secao-tecnologias/` foi aprovado no mesmo dia.

## What Changes

- **Seis grupos** em cartões: Frontend, Estado e ferramentas, Backend e infra, Produto e integrações (novo), Qualidade e IA no desenvolvimento (novo). Cada tecnologia aparece com o logotipo e o nome.
- **Tecnologias novas,** todas conferidas nos repositórios:
  - CurrículoRaiz: TanStack Query, shadcn/ui, Prisma, PostgreSQL no Neon, Google Cloud Run, Vercel, Cloudflare, Mercado Pago com Pix, login com Google, GrowthBook, Puppeteer, Resend e Vitest.
  - Este portfólio: Three.js e Playwright.
  - IA no desenvolvimento: Claude Code, OpenSpec e graphify.
  - Os recursos de IA do produto ficam de fora, porque ainda estão só na lista de espera do Pro.
- **Marca "Usado no CurrículoRaiz":** um ponto laranja, com o texto equivalente para leitor de tela.
- **Movimento:** os cartões sobem em cascata, as tecnologias aparecem uma a uma, e um brilho segue o ponteiro dentro do cartão. No hover, o logotipo ganha a cor da marca.
- **Título:** "Do componente ao deploy", em pt, en e es.
- **Lista enxuta:** 32 tecnologias nos cartões, e o que é esperado de um sênior ou é detalhe de ferramenta numa linha de texto no fim ("Também: …"), aprovada pelo dono.
- **Sem faixa de logotipos:** o protótipo tinha uma faixa animada acima dos cartões. Na revisão no navegador, o dono achou a seção carregada, e a faixa saiu porque repetia os logotipos dos cartões.

## Capabilities

### New Capabilities
- `secao-de-tecnologias`: o que a seção mostra, como marca o CurrículoRaiz e o comportamento com movimento reduzido, sem JavaScript e com leitor de tela.

### Modified Capabilities

(nenhuma: as specs anteriores ainda não foram arquivadas em `openspec/specs/`.)

## Impact

- **Código:** um novo `components/sections/Skills.tsx` (de servidor), uma ilha mínima de cliente (brilho no cartão), `lib/content/skills.ts` (grupos, ícones e marca do CurrículoRaiz), `components/sections/About.tsx` e `app/globals.css`.
- **Arquivos:** `public/icons/tech.svg`, uma folha de símbolos com os logotipos do Simple Icons (CC0) e ícones do lucide onde não há logotipo. Ela é gerada por `scripts/tech-icons/build.mjs`, sem dependência no projeto.
- **Conteúdo:** `messages/{pt,en,es}.json`. Em `about.skills.<grupo>.items`, a lista vira um objeto por id.
- **Peso:** nenhuma biblioteca nova. O custo é a folha de símbolos, baixada uma vez e guardada em cache, e cerca de 1 kB de JavaScript.
