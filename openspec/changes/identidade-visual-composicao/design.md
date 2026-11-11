## Context

A fundação deixou o site em Next 16, React 19, next-intl 4 e Tailwind 4, com testes de hidratação, capturas de referência e axe. Visualmente, nada mudou. Hoje:

- todas as seções são componentes de cliente (`"use client"`) e usam `framer-motion` para entrar na tela. O estado inicial delas (`opacity: 0`) vai no HTML do servidor, então, sem JavaScript, metade da página fica invisível;
- os tokens de `app/globals.css` são da paleta azul antiga, e `--text-muted` reprova no contraste;
- `messages/*.json` mistura texto com dados estruturais (URL, caminho de imagem, stack, datas). A tradução automática já quebrou um caminho de imagem em `/es`;
- o protótipo aprovado existe em dois arquivos: `design/prototipos/site-completo-desktop.html` e `site-completo-celular.html` (estrutura, conteúdo e layout), e `design/prototipos/prototipo-b/` (linguagem de movimento). O protótipo B usa GSAP, ScrollTrigger e um mundo em Three.js. Esta change porta o movimento, sem essas bibliotecas e sem o 3D.

Motivação e escopo: ver `proposal.md`. Requisitos: ver as specs `identidade-visual`, `pagina-inicial` e `movimento-e-alternativas`.

## Goals / Non-Goals

**Goals:**
- O HTML do servidor ser a página completa e final, e o JavaScript só acrescentar movimento e interações.
- Reduzir o JavaScript da rota, em vez de aumentar.
- Deixar a base pronta para a change `cena-3d-montagem`: o lugar da cena no Hero, a imagem estática que ela substitui e a regra de tema já existem.

**Non-Goals:**
- Sistema de componentes genérico (shadcn/ui): o site tem quatro controles interativos (menu, idioma, tema, formulário). Uma base Radix só se paga quando houver diálogo, popover ou combobox, o que esta change não traz.
- Reescrever a lógica do formulário: ela muda no bloco 5 da fundação. Aqui ele só muda de aparência e de lugar.

## Decisions

### 1. Movimento em CSS e um `IntersectionObserver`, sem biblioteca de animação

Os efeitos aprovados são entradas que acontecem uma vez (texto por palavra, blocos que sobem, barras que crescem). Nenhum deles acompanha a rolagem quadro a quadro (o `scrub` do protótipo B era só do 3D e dos cartões empilhados, que ficaram de fora). Para entradas únicas, `transition` e `@keyframes` com atraso por índice (`--i`) bastam, e o gatilho é um único observador para a página toda.

- **Custo:** cerca de 1 kB de JavaScript próprio. Sai o `framer-motion` (o pacote compartilhado do site tem hoje cerca de 35 a 45 kB gzip só dele), então a rota fica menor.
- **Alternativas consideradas:**
  - `motion` com `LazyMotion` (cerca de 15 kB): é a stack-alvo de `openspec/config.yaml`, mas nenhum efeito aprovado precisa de animação de layout, mola ou gesto. Fica como plano B se a change de 3D ou a de projetos exigir.
  - GSAP com ScrollTrigger (cerca de 45 kB): é o que o protótipo usa, mas seria uma segunda ferramenta para a mesma finalidade, e ScrollTrigger só se justifica com `scrub` ou `pin`.
  - CSS `animation-timeline: view()`: ainda não funciona no Firefox, então não serve como mecanismo único.
- **Desvio da stack-alvo:** registrado aqui. `motion` sai da lista até haver um efeito que precise dele.

### 2. O HTML do servidor já é o estado final; o estado "antes da entrada" só existe depois que o JavaScript prova que funciona

- O nome do Hero anima só com CSS (`@keyframes` ao carregar, sem JavaScript), dentro de `@media (prefers-reduced-motion: no-preference)`. Sem JavaScript, ele anima igual. Com movimento reduzido, aparece parado.
- O restante (`[data-reveal]`) começa visível no HTML. Um componente de cliente, montado uma vez no layout, marca `<html data-motion="ready">`. Nesse momento, ele marca como já revelado tudo o que está na tela ou acima dela, e só então o CSS esconde o que ainda está abaixo (`[data-motion=ready] [data-reveal]:not([data-revealed])`). O observador revela cada bloco ao entrar na tela.
- Se o JavaScript falhar, `data-motion` nunca é marcado e nada fica escondido. Não há marcação de classe antes da hidratação, então não há risco de divergência.
- **Foco:** um `focusin` no documento revela na hora o bloco que contém o elemento focado.
- **Alternativa rejeitada:** um script inline no `<head>` marcando `.js` antes da pintura. Funciona, mas esconde o conteúdo antes de o observador existir. Se o bundle falhar, o conteúdo some.

### 3. Texto por palavra renderizado no servidor

`<SplitText>` é um componente de servidor. Ele emite o título com a frase inteira em `<span class="sr-only">` e as palavras em `<span aria-hidden="true">`, cada uma numa máscara com `overflow: hidden` e um `--i` para o atraso. Assim, o leitor de tela lê a frase uma vez, o HTML é idêntico no servidor e no cliente, e copiar o título dá o texto normal (as palavras visíveis ficam com `user-select` normal e a frase oculta com `user-select: none`).

- **LCP:** a animação do nome usa só `transform` (as palavras sobem de dentro da máscara), começa no primeiro quadro e dura 0,9 s, com 50 ms de intervalo entre palavras. O critério de aceitação é medir: se o LCP no celular subir mais de 100 ms em relação ao nome parado, o nome perde a animação e só o restante do Hero anima.

### 4. Seções como componentes de servidor, com ilhas de cliente pequenas

Hero, Sobre, Projetos, Trajetória e Rodapé passam a ser componentes de servidor (`getTranslations`). Ficam no cliente só: o cabeçalho (menu de celular, tema e idioma), o observador de movimento e o formulário de contato. Isso adianta parte da change `conteudo-no-servidor-e-seo`: as seções são reescritas aqui de qualquer jeito, então já nascem no servidor. O SEO continua lá.

### 5. Tokens semânticos e aliases temporários

`app/globals.css` passa a ter tokens semânticos (`--bg`, `--surface`, `--surface-2`, `--line`, `--line-strong`, `--text`, `--text-2`, `--text-3`, `--accent`, `--accent-text`, `--on-accent`, `--ok`, `--focus`), definidos para `:root` (claro) e `.dark` e expostos ao Tailwind por `@theme inline` (`bg-bg`, `text-text-2`…). Valores, com os contrastes medidos sobre o fundo e as superfícies:

| Token | Escuro | Claro | Pior contraste medido |
|---|---|---|---|
| `--text` | `#F2EEE6` | `#171612` | 12,9:1 |
| `--text-2` | `#BDB6A8` | `#4A463E` | 6,7:1 |
| `--text-3` | `#958E81` | `#655F55` | 4,5:1 (sobre `--surface-2` no claro: usar só sobre `--bg` e `--surface`) |
| `--accent-text` | `#FF8A55` | `#A8360A` | 4,7:1 |
| `--ok` (texto) | `#5BC48A` | `#145C31` | 5,0:1 (no claro, escurecido de `#1E7A45` no bloco 1: o selo verde sobre o próprio tom a 10% dava 3,8:1) |
| `--line-strong` (borda de campo) | `#958E81` | `#655F55` | ≥ 3:1 |
| `--focus` | `#FF6B2C` | `#A8360A` | 6,5:1 e 5,8:1 (o laranja de preenchimento dá 2,5:1 no claro e reprova) |

`--line` (`#34312C` / `#CFC8B9`) fica só para divisões decorativas, nunca como única borda de campo. Durante os blocos 1 a 4, os nomes antigos (`--text-primary`, `--accent-primary`…) viram aliases dos novos, para as seções ainda não reescritas já aparecerem na paleta nova. No último bloco, os aliases saem.

### 6. Fontes pelo `next/font/google`

Bricolage Grotesque (variável, eixos `opsz` e `wght` 600 a 800), Instrument Sans (400 a 600) e JetBrains Mono (400 e 700), só no subconjunto `latin` (cobre pt, en e es), com `display: swap` e o ajuste automático da fonte reserva do `next/font`, que evita salto de layout. As fontes são servidas pelo próprio site. Só as duas primeiras são pré-carregadas. Estimativa: cerca de 90 kB de fonte no total, contra cerca de 50 kB da Inter de hoje. A Inter sai.

### 7. Dados estruturais em `lib/content/`, texto em `messages/`

`lib/content/projects.ts` e `lib/content/career.ts` guardam, por `id`, a URL, a imagem e suas dimensões, a stack, as datas (`AAAA-MM`), o regime e se o projeto é o destaque. `messages/*.json` guarda só texto, chaveado pelo mesmo `id`. Um teste de unidade confere que todo `id` de `lib/content` tem texto nos três idiomas. Isso tira da tradução automática os caminhos e URLs, a mesma classe de erro da tarefa 5.7a da fundação.

### 8. Régua calculada no servidor

As posições das barras saem de uma função pura (`periodo → left% e width%`, de janeiro de 2019 ao mês do build), testada com as datas reais. A régua é `aria-hidden`, e a lista de experiências é o conteúdo acessível. Cada barra cresce com `transform: scaleX` a partir da esquerda. Abaixo de 900 px, a régua não é renderizada visualmente (`hidden`), e a lista continua.

O "mês atual" da barra da HostGator é o mês do build. Como a página é estática, a barra só avança a cada publicação. Isso é aceitável para um portfólio publicado com frequência e evita JavaScript para uma data.

### 9. Imagem da cena no Hero

`cena-blocos-escuro.png` e `cena-blocos-claro.png` viram WebP **sem perdas** (34 e 40 kB) em `public/images/scene/`, servidos como **imagem de fundo em CSS**, uma regra por tema (`.hero-scene` e `.dark .hero-scene`), num elemento `aria-hidden` com `aspect-ratio` fixo, o que evita salto de layout.

- **Uma imagem só:** o navegador baixa só a imagem da regra que se aplica, então a do tema oculto nunca é baixada.
- **LCP:** a imagem é descoberta junto com o CSS. Na primeira versão, com duas `next/image` e `loading="lazy"`, a imagem virou o elemento de LCP e esperou 1,9 s para começar a baixar (LCP de 3,7 s).
- **Sem perdas:** o WebP com perdas, e a recodificação do `next/image`, desviavam o fundo da imagem em 1 ou 2 tons do `--bg`, o que deixava um retângulo visível em volta da cena.

O texto do Hero não depende da imagem. A change `cena-3d-montagem` vai montar o canvas por cima e usar esta imagem enquanto carrega e como alternativa.

### 10. Link de agendamento num só lugar

`lib/contact.ts` exporta `AGENDA_URL` (string vazia por padrão). O link é público, então não precisa de variável de ambiente. Vazio, os componentes não renderizam "Agendar call". O formulário fica num `<details>` nativo ("Prefere escrever por aqui?"), que abre por teclado e anuncia o estado sem JavaScript.

### 11. Menu de celular

Botão com `aria-expanded` e `aria-controls`. Ao abrir, o foco vai para o primeiro link. Esc fecha o menu e devolve o foco ao botão, assim como clicar num link ou fora do menu. Não prende o foco, porque o menu não cobre a página como diálogo. A troca de idioma vira três links (PT, EN e ES), com `aria-current="true"` e o nome do idioma por extenso para leitores de tela, no lugar do menu suspenso atual.

### 12. Orçamento de desempenho

Medido no perfil de celular do Lighthouse, na build de produção: LCP abaixo de 2,5 s, CLS abaixo de 0,1, bloqueio total abaixo de 200 ms (substituto de laboratório para o INP abaixo de 200 ms) e JavaScript da rota menor que o do fim da fundação. O peso do JavaScript é medido somando os chunks que `/pt` carrega, antes e depois. O número do fim da fundação é registrado na tarefa 1.1.

**Método (definido no bloco 6):** o critério de aprovação é o Lighthouse no perfil de celular com **limitação real** de rede e CPU (`--throttling-method=devtools`: 4G lento e CPU 4× mais lenta aplicados de fato ao navegador). O valor **simulado** (Lantern, padrão do Lighthouse e do PageSpeed) é registrado ao lado como referência, mas não é o critério. Motivo: no bloco 6, duas builds com as mesmas requisições antes do LCP deram 2,6 e 3,4 s no simulado, enquanto a limitação real deu 1,9 s nas duas. O simulado oscila com a ordem dos eventos da medição rápida em que se baseia, e o real se repete. Números finais em `tasks.md`, na 6.7, e em `docs/otimizacao-de-desempenho.md`.

### 13. Protótipo e heurísticas de Nielsen

O protótipo já foi aprovado pelo dono no navegador (HTML, `design/prototipos/`, além do `prototipo.pen` da direção). Não há tela nova fora dele. Avaliação das telas novas contra as heurísticas:

1. **Visibilidade do estado:** o idioma atual e o link da seção ficam marcados, e o formulário mostra estado de envio, sucesso e erro.
2. **Correspondência com o mundo real:** períodos em "mai 2022 — mai 2025", régua em anos e rótulos na linguagem de quem recruta.
3. **Controle e liberdade:** Esc fecha o menu, "Voltar ao topo" fica no rodapé, nada sequestra a rolagem e o formulário recolhe.
4. **Consistência e padrões:** um só estilo de link externo, um só botão primário por tela e o mesmo cabeçalho em todos os idiomas.
5. **Prevenção de erros:** sem "Agendar call" morto, sem link para `#`, e validação antes do envio.
6. **Reconhecer em vez de lembrar:** canais com rótulo e valor visível (o e-mail aparece escrito).
7. **Flexibilidade e eficiência:** "Agendar call" e "Baixar CV" acessíveis do cabeçalho e o link para pular ao conteúdo.
8. **Estética e minimalismo:** saem as partículas, os contadores, o filtro e o gradiente. É o "menos sobrecarregado" pedido pelo dono.
9. **Ajudar a reconhecer e corrigir erros:** mensagens de campo traduzidas, ao lado do campo.
10. **Ajuda e documentação:** não se aplica além dos rótulos claros, porque é uma página de leitura.

## Risks / Trade-offs

- [Animação do nome atrasa o LCP] → medir antes e depois (decisão 3). Se passar de 100 ms, o nome fica parado.
- [Tradução automática do texto novo sai com tom errado ou quebra nomes próprios] → depois do `npm run translate`, o dono lê en e es. Com os dados estruturais fora das mensagens (decisão 7), o pior caso é um texto ruim, e não uma imagem quebrada.
- [Fontes mais pesadas que a Inter] → só o subconjunto `latin`, pré-carregar só duas e conferir o CLS. Se o LCP sofrer, a JetBrains Mono passa a usar fonte do sistema.
- [Conflito com o bloco 5 da fundação, que mexe no formulário] → esta change só troca a marcação e o estilo do formulário, sem tocar em `app/api/contact` nem no schema. O bloco 5 vem depois e parte do componente novo.
- [Capturas de referência mudam inteiras] → regerar de propósito a cada bloco (`npm run test:e2e:update`) só depois de o dono aprovar no navegador.
- [Barra da HostGator parada até a próxima publicação] → aceito (decisão 8).
- [CurrículoRaiz como destaque não confirmado] → a escolha do destaque é um campo em `lib/content/projects.ts`. Trocar não muda layout nem tarefas.

## Migration Plan

Entrega em blocos, cada um testável no navegador (ver `tasks.md`). Os aliases da decisão 5 mantêm as seções antigas coerentes enquanto as novas entram. Nada muda na infraestrutura. Para reverter, basta voltar o commit da change. Não há dado persistido nem rota nova.

## Open Questions

Dados que o dono confirma durante a implementação. Nenhum deles muda o layout ou as tarefas, só o que é publicado:

- Destaque de Projetos: CurrículoRaiz (recomendado) ou Dashboard HostGator.
- Link da página de agendamento do Google Agenda. Até existir, "Agendar call" não aparece.
- "Remoto" na linha de situação do Hero e a frase que explica as sobreposições da trajetória (bolsa de pesquisa com o Sidia, e PJ da O2 Filmes em paralelo à Atem). Até a confirmação, ficam fora.
- "Freelas" em "Aberto a oportunidades, freelas e colaborações". Até a confirmação, fica "Aberto a oportunidades e colaborações".
