## 1. Conteúdo e ícones

- [x] 1.1 `lib/content/skills.ts` com os seis grupos, ícones e marca do CurrículoRaiz
- [x] 1.2 `messages/{pt,en,es}.json`: grupos novos, itens por id, título, legenda e textos da pausa
- [x] 1.3 `scripts/tech-icons/build.mjs` gera `public/icons/tech.svg` e `lib/content/tech-icon-colors.ts`

## 2. Seção

- [x] 2.1 `Skills.tsx` de servidor: cabeçalho com legenda, cartões e tecnologias (a faixa decorativa saiu na revisão)
- [x] 2.2 Ilha `CardGlow`
- [x] 2.3 CSS: cartões, tecnologias, cascata e brilho

## 3. Verificação

- [x] 3.1 Testes: ids iguais entre o código e os três idiomas, ícone existente na folha, marca do CurrículoRaiz com texto para leitor de tela
- [x] 3.2 Lint, tipos, testes, build, axe e capturas visuais novas; peso da folha registrado em `docs/otimizacao-de-desempenho.md`
- [x] 3.3 Lista enxuta (cerca de 30 tecnologias), aprovada pelo dono
- [ ] 3.4 Conferência do dono no navegador
