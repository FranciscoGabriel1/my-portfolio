## 1. Protótipo (aprovação do dono antes do código)

- [x] 1.1 Protótipo HTML em `design/prototipos/cena-3d-hero/`, com o Hero atual e a cena real (Three.js 0.187 por CDN, só no protótipo): composição montada, troca imagem → cena, assentamento, inclinação pelo ponteiro e afastamento com a rolagem, nos temas claro e escuro
  - Composição trocada a pedido do dono: "camadas da interface" (tokens → componentes → tela) em vez da formação abstrata do protótipo B, para falar de engenharia de software (ver design, decisão 4).
  - Ajustes descobertos no protótipo: o canvas é 1,5× maior que o contêiner, com o campo de visão compensado, para os blocos se afastarem sem corte na borda, e ignora cliques. A vista explodida se completa na primeira metade da rolagem do Hero. O Three.js 0.187 não tem mais a sombra suave antiga (`PCFSoftShadowMap`), então a cena usa `PCFShadowMap`.
- [x] 1.2 Transição circular do tema no mesmo protótipo, a partir do botão, por clique e por teclado, instantânea com movimento reduzido
- [x] 1.3 Ajustar enquadramento e paletas por tema; abrir no Chrome; dono aprova; registrar no design a avaliação pelas heurísticas de Nielsen e o enquadramento final
  - Aprovado pelo dono em 2026-11-11 ("pode aplicar!"): variante **realista** (`scene-realista.js`), com o editor do CurrículoRaiz em vídeo no notebook, a página inicial no tablet e o painel admin com dados de demonstração no celular. Heurísticas: decisão 10 do design. Enquadramento final: `CAM` e `REST` de `scene-realista.js`.

## 2. Transição circular do tema

- [x] 2.1 `ThemeToggle` com a View Transitions API: centro do botão, raio até o canto mais distante, classe `dark` e `color-scheme` aplicados na hora dentro da atualização, `setTheme` para salvar e `skipTransition()` em trocas seguidas; troca direta sem a API ou com movimento reduzido
- [x] 2.2 CSS das pseudo-classes `::view-transition-*` e transições de cor desligadas durante a captura
- [x] 2.3 Testes de navegador: troca instantânea com movimento reduzido; dois cliques rápidos terminam no tema de partida; com teclado, o foco continua no botão e o rótulo muda
  - `tests/e2e/tema.spec.ts` (4 testes, 3 execuções verdes). A suíte completa revelou um defeito da change anterior: o bloco revelado pelo foco do teclado ainda esmaecia por 0,8 s, e a spec pede visível na hora. Corrigido com `data-reveal-instant` em `MotionReady` e no CSS; suíte completa (43 testes) verde em 3 execuções seguidas.
- [x] 2.4 `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`; dono confere a transição no Chrome, nos dois sentidos, com mouse, teclado e no celular (aprovado pelo dono em 2026-11-11)

## 3. Cena 3D no Hero

- [ ] 3.1 Instalar `three` e medir o pedaço do bundle com a cena (gzip); registrar aqui; se passar de 170 kB, parar e avaliar alternativas antes de seguir
- [ ] 3.2 Função pura de decisão do portão (movimento reduzido, WebGL, economia de dados, memória e núcleos), com testes de unidade de cada condição
- [ ] 3.3 Módulo `components/scene/hero-scene.ts`, portado do protótipo aprovado: blocos, luzes, sombras, fundo transparente, cores por tema, assentamento, ponteiro, rolagem, níveis de qualidade, pausa, falhas e `destroy()`
- [ ] 3.4 `HeroSceneLoader` no Hero: portão, `load` + ócio + Hero na tela, `import()` dinâmico, troca imagem → cena, `data-scene-state`, retorno à imagem quando o movimento reduzido é ligado
- [ ] 3.5 Página de captura e `scripts/render-scene-posters.ts`; regenerar `blocks-{light,dark}.webp` (sem perdas, fundo transparente, até 60 kB cada) e conferir que o primeiro quadro da cena coincide com a imagem
- [ ] 3.6 Testes de navegador da cena: aparece com WebGL e o Three.js só é pedido depois do `load`; com WebGL desligado, movimento reduzido ou economia de dados, nenhum pedido e estado `poster`; `paused` fora da tela e com a aba oculta
- [ ] 3.7 Lint, tipos, testes e build; dono confere no Chrome: claro e escuro, mouse, rolagem, celular e WebGL desligado (`--disable-webgl`)

## 4. Verificação e entrega

- [ ] 4.1 Lighthouse no perfil de celular com limitação real, 3 execuções em `/pt`, `/en` e `/es`: LCP até 2,0 s, CLS 0, bloqueio total abaixo de 200 ms e JS inicial até 230 kB gzip; anotar os números aqui
- [ ] 4.2 Axe sem violações WCAG 2.2 AA nos três idiomas, dois temas, 1440 e 390 px; capturas de referência regeneradas de propósito por causa da imagem nova
- [ ] 4.3 Suíte completa verde: `npm run lint`, `npm run typecheck`, `npm test` e `npm run test:e2e`
- [ ] 4.4 Conferência manual: leitor de tela (Orca) no Hero, só teclado, movimento reduzido ligado com a cena rodando, celular real se possível
- [ ] 4.5 Atualizar `docs/otimizacao-de-desempenho.md` (custo da cena, portão, troca imagem → cena, transição de tema e resultados), `README.md` e rodar `graphify update .`
