## Context

- O Hero mostra a cena dos blocos como imagem de fundo em CSS (`.hero-scene`, uma por tema, WebP sem perdas, a escura pré-carregada). Ela é o elemento de LCP. Com limitação real de rede e CPU, o LCP está em 1,9 s, o bloqueio total entre 110 e 140 ms e o JavaScript inicial em 224 kB gzip (ver `docs/otimizacao-de-desempenho.md`).
- As imagens atuais foram desenhadas fora do Three.js, num render isométrico feito em Python. Uma cena 3D real não bate com elas pixel a pixel.
- O mundo 3D do protótipo B (`design/prototipos/prototipo-b/mundo.js`) já resolve boa parte do problema: blocos arredondados por extrusão, paleta osso, grafite, ardósia, sálvia e um laranja, luz quente com contraluz fria, sombras suaves, qualidade por aparelho, pausa fora da tela e com a aba oculta, e volta ao pôster quando o contexto WebGL se perde. Ele carregava o Three.js por CDN e era guiado por capítulos, o que fica fora desta change.
- O tema é controlado pelo `next-themes` 0.4, que aplica a classe `dark` no `<html>` num efeito do React depois de `setTheme`.

Motivação: `proposal.md`. Requisitos: specs `transicao-de-tema` e `cena-3d-do-hero`.

## Goals / Non-Goals

**Goals:**
- Zero custo no carregamento inicial: o primeiro byte de Three.js só sai depois do LCP.
- Troca imagem → cena invisível, com o primeiro quadro igual à imagem.
- Um único caminho de código para a cena, sem duplicar a lógica do protótipo dentro de React.

**Non-Goals:**
- Interação com os blocos (arrastar, clicar). A cena é decorativa.
- Câmera guiada por capítulos e etiquetas na cena.

## Decisions

### 1. Three.js puro, sem react-three-fiber

A cena tem cerca de 20 malhas, nenhum estado de interface e um laço de quadros próprio. O react-three-fiber acrescentaria um reconciliador e o custo de montar a cena como árvore React (cerca de 40 kB gzip a mais), sem ganho, porque nada na cena vem de props.

- **Escolha:** um módulo imperativo (`components/scene/hero-scene.ts`) que recebe o elemento, o tema e as preferências, e devolve `{ setTheme, destroy }`. É o mesmo formato de `createWorld` no protótipo.
- **Custo:** `three` 0.187 importado por classes nomeadas. Estimativa de 120 a 150 kB gzip, medida na tarefa 3.1 e registrada.
- **Alternativa:** CSS 3D com `transform-style: preserve-3d`, cerca de 0 kB, foi descartada porque não faz sombras suaves nem luz, que são o que dá a cara de argila da direção aprovada.

### 2. Portão de carregamento: só quem pode, só depois do LCP

Um componente de cliente pequeno (`components/scene/HeroSceneLoader.tsx`, menos de 2 kB) decide e carrega:

1. **Condições:** `prefers-reduced-motion: no-preference`, WebGL disponível (teste com um canvas descartável e `WEBGL_lose_context`), `navigator.connection.saveData` diferente de verdadeiro e o aparelho não fraco (`navigator.deviceMemory >= 4` e `navigator.hardwareConcurrency >= 4`, quando o navegador informa). Se qualquer condição falhar, não faz nada, e a imagem fica.
2. **Momento:** depois do evento `load`, em `requestIdleCallback` (com limite de 2 s), e só quando o Hero está na tela ou perto dela (`IntersectionObserver`). Quem abre a página já rolada não baixa nada até voltar ao Hero.
3. **Importação:** `import("./hero-scene")`, que traz o Three.js num pedaço separado do bundle.

Movimento reduzido ligado depois: o carregador escuta a media query, chama `destroy()` e a imagem volta.

### 3. Imagens geradas pela própria cena

Para o primeiro quadro ser idêntico à imagem, as imagens passam a ser renders da cena.

- **Geração:** um script de desenvolvimento (`scripts/render-scene-posters.ts`, Playwright já instalado) abre uma página de captura que monta a cena no estado montado, com o enquadramento final e o tema pedido, e salva o canvas.
- **Formato:** WebP sem perdas, com **fundo transparente** (renderer com `alpha: true` e sem névoa). Com fundo transparente, o fundo da página aparece por trás, e o problema de desvio de tom do fundo resolvido no bloco 2 da identidade some de vez.
- **Arquivos:** os mesmos `public/images/scene/blocks-{light,dark}.webp`, então nada muda no CSS, na pré-carga nem no LCP. Meta: até 60 kB cada.

### 4. Composição, troca e movimento

- **Composição: "camadas da interface"** (escolha do dono em 2026-11-11, no lugar da formação abstrata do protótipo B, para a cena contar o trabalho de um engenheiro de software). São três placas em escada, cada uma mais alta e mais ao fundo, para as três ficarem visíveis:
  - **tokens:** cinco amostras de cor, escala de tipo e escala de espaçamento;
  - **componentes:** botão, campo com cursor, cartão, interruptor e caixa de seleção;
  - **tela:** janela com barra de título e três pontos, menu lateral, gráfico de colunas, painéis, linhas de texto e botão laranja.

  - **Variante "aparelhos"** (pedida pelo dono em seguida, padrão do protótipo): a mesma interface em notebook aberto, tablet em pé e celular deitado, cada tela com o layout do seu tamanho (design responsivo). Na entrada, os aparelhos assentam e as peças da interface pousam na tela. Na rolagem, os aparelhos se afastam e as peças saem da tela ao longo da normal dela (`design/prototipos/cena-3d-hero/scene-dispositivos.js`).

  - **Variante "realista"** (pedida pelo dono em seguida, padrão atual do protótipo, `scene-realista.js`): notebook de alumínio inteiriço com teclado de teclas individuais (malha instanciada) e trackpad, tablet de bordas finas com duas câmeras e celular de traseira de vidro colorido com módulo de câmera. **Sem logotipos nem nomes de marca**: o estilo lembra os aparelhos citados pelo dono, mas o realismo vem de materiais com reflexo (`MeshPhysicalMaterial`), luz de estúdio (`RoomEnvironment` + PMREM), luz de contorno e sombras de contato. As telas mostram a **página pública do CurrículoRaiz** (produto do dono, pedido dele) no layout de cada tamanho (capturas de 1280, 820 e 390 px), rolando sozinhas. A mesma imagem serve aos dois temas. Sem login e sem dados pessoais: o dono mandou um print do editor com telefone e CEP, que não é usado. Alternativa guardada no protótipo: `?telas=portfolio`, com o próprio portfólio. **Celular:** o painel admin do CurrículoRaiz no layout de celular, renderizado a partir do código real (`meuresumo/curriculoraiz-web`, servidor de desenvolvimento local) com a API simulada no navegador de teste (`/users/me` e `/admin/overview`). Os números são **de demonstração**, escolha do dono em 2026-11-11, e os nomes e e-mails da lista de cadastros são fictícios (`exemplo.com`). Nenhum dado real de usuário ou do negócio entra na imagem. (A nota visível que avisava dos dados de demonstração foi retirada a pedido do dono.) O script de captura vai para `scripts/` na tarefa 3.5, para as telas poderem ser regeneradas. **Notebook:** um **vídeo do editor real em uso** (pedido do dono): o editor do CurrículoRaiz rodando localmente com a API simulada e o currículo de exemplo público da **Ada Lovelace** (gerado pelo próprio código de exemplos da API), gravado pelo Playwright com um cursor desenhado na página. Roteiro de 39 s: recolher as seções, arrastar "Competências" para cima de "Experiência", digitar um cargo novo com a prévia atualizando, abrir "Ver modelos" e trocar para Executivo e Moderno (prévia Pro), e parar sobre o PDF. VP9, 1024×640, 471 kB, reproduzido a 1,3× como `VideoTexture`, pausado junto com a cena. No celular (toque), um quadro parado de 42 kB no lugar do vídeo. Nota junto da cena: o dono pediu para retirá-la em 2026-11-11; os nomes e números das telas continuam fictícios. Peso total das telas no computador: cerca de 600 kB, depois do LCP. Animação: entrada (aparelhos sobem e assentam, tampa abre até cerca de 108°), flutuação leve e contínua, telas rolando, inclinação com o ponteiro e, na rolagem da página, aparelhos se afastando e a tampa fechando aos poucos. Custo extra: cerca de 600 kB de telas no computador (vídeo do editor 471, tablet 86, celular 38 kB) e 166 kB no celular (sem o vídeo) e os módulos `RoundedBoxGeometry` e `RoomEnvironment`, tudo depois do LCP. Medir na 3.1.

  **Escolha final do dono (2026-11-11): a variante realista.** As outras duas ficam no protótipo só como registro.
- **Troca:** o canvas fica por cima da imagem, no mesmo elemento (`.hero-scene`), com `opacity: 0`. Depois do primeiro quadro desenhado no estado montado, ele vai a 1 em 400 ms e a imagem fica escondida por baixo, como reserva. Tamanho e posição são os do contêiner, então não há salto de layout.
- **Assentamento:** depois da troca, as camadas descem e se encaixam de baixo para cima (160 ms entre camadas), e as peças de cada camada assentam logo depois da placa, em 1,2 s com uma curva de saída suave.
- **Ponteiro:** só com `pointer: fine`. A câmera desloca até ±0,8 unidade na horizontal e ±0,5 na vertical, com amortecimento, como no protótipo.
- **Rolagem (vista explodida):** `p = clamp(scrollY / (0,55 × alturaDoHero), 0, 1)`, lido dentro do quadro e sem ouvinte de rolagem. As camadas se afastam na vertical (`p × camada × 2,4` unidades) e em profundidade, e as peças sobem um pouco da placa. A rolagem continua nativa, sem `scrub` de biblioteca.
- **Margem do canvas:** o canvas é 1,5× maior que o contêiner, com o campo de visão compensado, para a vista explodida não ser cortada na borda. Ele tem `pointer-events: none`, então nunca cobre os links do texto.

### 5. Qualidade por aparelho e economia

- **Níveis:**
  - ponteiro preciso e tela larga: DPR até 1,75 e sombras de 1024;
  - toque ou tela estreita: DPR até 1,3 e sem mapa de sombras, com um plano de sombra difusa pré-desenhado sob a placa;
  - se a média dos primeiros 60 quadros passar de 33 ms, o nível cai uma vez (DPR 1 e sem sombras); se continuar lento, a cena se destrói e a imagem volta.
- **Pausa:** `IntersectionObserver` no Hero e `visibilitychange`. O estado fica exposto em `data-scene-state` (`loading`, `running`, `paused`, `poster`) no contêiner, para testes e depuração.
- **Falhas:** `webglcontextlost`, erro no `import()` ou exceção na montagem levam a `destroy()` e à imagem, sem nada no console além de um `console.warn` em desenvolvimento.
- **Limpeza:** `destroy()` libera geometrias, materiais, renderer e ouvintes, como no protótipo.

### 6. Tema na cena

- **Cores:** a cena lê `document.documentElement.classList.contains("dark")` ao montar e observa a classe com um `MutationObserver`. Na troca, atualiza as cores dos materiais e a opacidade do plano de sombra, sem recriar nada.
- **Paletas:** osso, grafite, ardósia, sálvia e laranja, ajustadas por tema na tarefa 1.3. No claro, a placa fica em grafite claro, e as sombras, mais suaves.

### 7. Transição circular do tema com a View Transitions API

No `ThemeToggle`:

1. Sem `document.startViewTransition` ou com movimento reduzido: `setTheme(next)` direto, como hoje.
2. Senão: calcula o centro do botão e o raio até o canto mais distante da janela, e chama `document.startViewTransition(update)`. Dentro de `update`, aplica a classe `dark` e o `color-scheme` no `<html>` na hora, porque o `next-themes` só aplica num efeito posterior e a captura da tela nova sairia no tema antigo. Em seguida chama `setTheme(next)` para salvar a escolha.
3. Em `transition.ready`, anima `clip-path: circle(0 at x y)` até `circle(r at x y)` no pseudo-elemento `::view-transition-new(root)`, em 600 ms com a curva `--ease-out-soft`.
4. **CSS:** `::view-transition-old(root)` e `::view-transition-new(root)` com `animation: none` e `mix-blend-mode: normal`. Durante a captura, as transições de cor dos elementos ficam desligadas por um quadro, para a tela nova não sair no meio de um `transition-colors`.
5. **Trocas seguidas:** guarda a transição em andamento e chama `skipTransition()` antes de iniciar outra. O estado final é sempre o último tema pedido.

- **Custo:** 0 kB de biblioteca, cerca de 1 kB de código.
- **Alternativa:** sobrepor uma camada com `clip-path` e o fundo novo. Foi descartada porque só pinta o fundo, e não a página inteira no tema novo.

### 8. Testes

- **Playwright:**
  - com WebGL (o Chromium de teste usa SwiftShader): o canvas aparece, `data-scene-state` vira `running` e o pedaço do Three.js só é pedido depois do `load`;
  - com `--disable-webgl`, com movimento reduzido e com economia de dados simulada: nenhum pedido do Three.js e `data-scene-state="poster"`;
  - ao rolar até Projetos, o estado vira `paused`;
  - com a aba oculta (`visibilitychange` simulado), também `paused`.
- **Transição:** com movimento reduzido, nenhuma animação em `::view-transition-*`; com dois cliques rápidos, o tema final é o de partida.
- **Capturas de referência:** continuam com movimento reduzido, portanto com a imagem. A imagem nova muda as capturas do Hero, que são regeneradas de propósito.

### 9. Orçamento e método

Lighthouse no perfil de celular com limitação real (`--throttling-method=devtools`), três execuções por idioma: LCP até 2,0 s, CLS 0, bloqueio total abaixo de 200 ms e JavaScript inicial até 230 kB gzip. O pedaço do Three.js é medido à parte e registrado no estudo de desempenho. Se o bloqueio total passar de 200 ms por causa da montagem da cena, a montagem é dividida em vários quadros, com geometrias criadas em lotes. Se ainda passar, o portão espera a primeira interação, rolagem ou ponteiro, em vez do ócio.

### 10. Protótipo e heurísticas de Nielsen

Antes do código, um protótipo HTML em `design/prototipos/cena-3d-hero/` com a cena real, a troca imagem → cena, o assentamento, o ponteiro, a rolagem e a transição de tema, nos dois temas, para o dono aprovar.

Avaliação contra as heurísticas:
- **Visibilidade do estado:** o círculo mostra de onde veio a troca de tema.
- **Controle e liberdade:** a rolagem nunca é sequestrada, e a cena não captura foco nem cliques.
- **Consistência:** a cena tem a mesma composição da imagem.
- **Prevenção de erros:** qualquer falha volta à imagem.
- **Estética e minimalismo:** um efeito no Hero e um na troca de tema, nada em segundo plano nas outras seções.

## Risks / Trade-offs

- [O Three.js avaliado logo após o `load` aumenta o bloqueio total no celular] → ócio com limite, montagem em lotes e, no pior caso, início na primeira interação (decisão 9).
- [O SwiftShader do teste é lento e dá falso "aparelho lento"] → nos testes, o rebaixamento de qualidade é desligado por parâmetro de ambiente de teste. O comportamento real do rebaixamento é coberto por teste de unidade da função de decisão.
- [A transição circular captura a tela inteira, e páginas longas podem engasgar em celulares fracos] → duração curta (600 ms). O navegador já pula a transição se a captura falhar, e o tema muda de qualquer jeito.
- [A imagem com fundo transparente perde a pré-carga com prioridade se o arquivo mudar de nome] → os nomes ficam iguais.
- [O `next-themes` aplicar a classe de novo depois do callback e causar um quadro errado] → a classe aplicada à mão é a mesma, então o efeito do `next-themes` não muda nada visível. Coberto por teste de dois cliques rápidos.
- [Tamanho do Three.js acima da estimativa] → medir na 3.1. Se passar de 170 kB gzip, avaliar `three/webgpu` ou cortar recursos (sombras pré-desenhadas sempre), antes de seguir.

## Migration Plan

Sem migração de dados. A transição de tema e a cena são independentes. Se a cena der problema em produção, basta o portão devolver sempre `false` (uma constante), e o site volta a ser o de hoje. A transição se desliga do mesmo jeito.
