# Como otimizei o desempenho do portfólio

Registro de estudo para entrevistas. Cada número aqui foi medido no próprio site, durante a change
`identidade-visual-composicao` (novembro de 2026), com as ferramentas descritas na seção 1.
Nenhum valor é estimativa.

---

## Resumo em 30 segundos

> Reconstruí o portfólio em Next.js 16 com React Server Components. O conteúdo passou a sair pronto
> do servidor, e o JavaScript ficou só para o que é interativo: cabeçalho e formulário. Tirei a
> biblioteca de animação (framer-motion) e troquei por CSS e um único `IntersectionObserver`.
> Também deixei a validação do formulário carregar sob demanda e mandei ao navegador só as traduções
> que ele usa. O JavaScript inicial caiu 27% (308 → 224 kB gzip), o tempo de bloqueio caiu de 200
> para cerca de 70 ms e o LCP medido no navegador foi de 1,25 s para 0,18 s. Tudo isso sem perder
> acessibilidade: o site funciona sem JavaScript, com movimento reduzido e só com teclado, e o axe
> não acusa nenhuma violação WCAG 2.2 AA. Com limitação real de rede e CPU de celular, o LCP fica em
> 1,9 s nos três idiomas, e a nota de desempenho, entre 97 e 98.

| Métrica (celular, Lighthouse 12) | Antes | Depois |
|---|---|---|
| JavaScript inicial da página (gzip) | 308 kB | **224 kB** (−27%) |
| JavaScript inicial (bruto) | 990 kB | 714 kB |
| Tempo total de bloqueio (TBT) | 200 ms | **60 a 90 ms** |
| Tempo de execução de scripts | 1.197 ms | cerca de 580 ms |
| LCP observado (navegador real, sem limitação) | 1.251 ms | **180 ms** |
| LCP com limitação real (4G lento + CPU 4× mais lenta) | não medido | **1,9 s** em pt, en e es (meta: < 2,5 s) |
| LCP simulado pelo Lighthouse (Lantern) | 3,2 s | 3,2 a 3,7 s (oscila; ver seção 1) |
| CLS | 0 | 0 |
| Nota de desempenho (limitação real) | — | **97 a 98** |
| Nota de desempenho (simulada) | 90 | 89 a 94 |
| Nota de acessibilidade | 97 | **100** |
| HTML da página | 129 kB | 117 kB |

---

## 1. Como medi (o método também é assunto de entrevista)

**Peso de JavaScript.** Um script lia o HTML da página, pegava todos os `<script src>` e somava o
tamanho de cada arquivo bruto e comprimido com gzip:

```bash
html=$(curl -s http://localhost:3001/pt)
for s in $(echo "$html" | grep -oE 'src="/_next/[^"]+\.js"' | sed 's/src="//;s/"$//' | sort -u); do
  curl -s "http://localhost:3001$s" | gzip -9 | wc -c
done
```

Para saber o que havia dentro de cada pedaço, procurei nomes de biblioteca no arquivo (`zod`,
`framer`, `useForm`…). Foi assim que descobri que o maior pedaço (124 kB gzip) era Zod + framer-motion.

**Lighthouse no perfil de celular**, sempre na build de produção (`next build && next start`),
nunca no modo de desenvolvimento:

```bash
npx lighthouse@12 http://localhost:3001/pt --output=json \
  --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo
```

- **Rodar mais de uma vez.** O mesmo build deu LCP de 3,1, 3,2 e 3,7 s em três execuções seguidas.
  Uma medição isolada não prova nada.
- **Comparar com e sem animação:** a flag do Chrome `--force-prefers-reduced-motion` simula o pedido
  de movimento reduzido. Com ela, medi o custo da animação do nome no LCP.
- **Ler as fases do LCP** (no JSON do Lighthouse, auditoria `largest-contentful-paint-element`):
  TTFB, atraso de carga, tempo de carga e atraso de renderização. Saber em qual fase o tempo está
  diz qual otimização faz sentido.

### LCP observado × LCP simulado (a lição mais importante)

O Lighthouse mostra dois valores de LCP:

- **Observado:** o que aconteceu de fato no navegador da máquina de teste, sem limitação. Aqui caiu
  de 1,25 s para 0,18 s.
- **Simulado (Lantern):** é o número da nota. O Lighthouse reconstrói o carregamento como se fosse um
  celular em 4G lento (cerca de 1,6 Mbps, 150 ms de latência, CPU 4× mais lenta). Nessa simulação,
  **todo recurso pedido antes do LCP disputa a mesma banda**, inclusive JavaScript assíncrono e fontes.

Por isso, o LCP simulado não cai na mesma proporção do observado: ainda há cerca de 510 kB disputando
banda antes da imagem principal (218 kB de JS, 136 kB de fontes, 73 kB de imagens). Em entrevista, a
frase é: *"no celular lento, o gargalo deixou de ser CPU e passou a ser bytes na rede"*.

**Terceira forma: limitação real (`--throttling-method=devtools`).** Em vez de simular, o Lighthouse
aplica de fato o 4G lento e a CPU 4× mais lenta ao navegador e mede. Foi ela que resolveu uma dúvida:
duas builds com **as mesmas requisições** antes do LCP deram 2,6 s e 3,4 s no simulado, e **1,9 s nas
duas** com limitação real, repetido em três execuções. O simulado oscila com a ordem dos eventos da
medição rápida em que se baseia. Por isso, o critério de aprovação do projeto passou a ser a limitação
real, e o simulado fica registrado ao lado.

> Frase de entrevista: "não confio numa métrica de laboratório sem saber como ela é calculada. Quando
> o número simulado oscilou quase 1 s entre builds idênticas em rede, medi com limitação real e
> separei o ruído do efeito".

---

## 2. As otimizações, uma por uma

### 2.1 Conteúdo renderizado no servidor (React Server Components)

- **Problema:** todas as seções eram componentes de cliente (`"use client"`). O navegador baixava e
  executava o código de cada seção só para mostrar texto estático.
- **Solução:** Hero, Sobre, Projetos, Trajetória, Contato e Rodapé viraram componentes de servidor
  (`getTranslations` do next-intl no servidor). Ficaram no cliente só três ilhas: o cabeçalho (menu,
  tema e idioma), o formulário de contato e um observador de animações de 1 kB.
- **Resultado:** a execução de scripts caiu de 1.197 ms para cerca de 580 ms. Com JavaScript desligado,
  o site inteiro continua legível.
- **Como falar:** "o JavaScript só existe onde há interação; o resto é HTML pronto".

### 2.2 O LCP não pode depender de animação (o maior ganho)

- **Problema:** LCP de 3,2 s, com 2,8 s de **atraso de renderização**. O elemento de LCP era a frase
  do Hero, e o framer-motion renderizava `opacity: 0` já no HTML do servidor. O texto chegava rápido,
  mas ficava invisível até o JavaScript carregar, hidratar e animar.
- **Solução:** o HTML do servidor passou a ser o **estado final** da página.
  - O nome do Hero anima só com CSS (`@keyframes`), usando só `transform`, dentro de
    `@media (prefers-reduced-motion: no-preference)`. Não depende de JavaScript.
  - As outras entradas ao rolar começam **visíveis**. Um componente de cliente, depois de montado,
    marca como revelado tudo o que já está na tela e só então põe `data-motion="ready"` no `<html>`.
    Só a partir daí o CSS esconde o que está abaixo da dobra, e um `IntersectionObserver` revela cada
    bloco ao entrar na tela.
  - Se o JavaScript falhar, nada fica escondido.
- **Resultado:** o LCP observado caiu para cerca de 0,26 s. Medi o nome animado contra o nome parado:
  3,9 e 3,8 s contra 3,9 e 3,8 s no simulado, ou seja, **a animação não custa nada no LCP**, então ficou.
- **Como falar:** "animação de entrada com `opacity: 0` no HTML do servidor é um anti-padrão de LCP;
  o estado escondido só pode existir depois que o JavaScript provou que roda".

### 2.3 Trocar a biblioteca de animação por CSS (sai o framer-motion)

- **Decisão:** os efeitos aprovados no protótipo (texto palavra por palavra, blocos que sobem, barras
  que crescem) acontecem **uma vez**, ao entrar na tela. Nenhum acompanha a rolagem quadro a quadro.
  Para isso, `transition`, `@keyframes` com atraso por índice (`--i`) e um único `IntersectionObserver`
  bastam.
- **Alternativas avaliadas pelo custo em KB:**
  - GSAP + ScrollTrigger (cerca de 45 kB): o protótipo usava, mas só se justifica com `scrub` ou `pin`.
  - `motion` com `LazyMotion` (cerca de 15 kB): ficou como plano B se surgir animação de layout ou gesto.
  - CSS `animation-timeline: view()`: não funciona no Firefox, então não serve como mecanismo único.
  - Escolha: CSS + 1 kB de JavaScript próprio.
- **Resultado:** entre o fim do bloco 2 e o fim do bloco 5, o JavaScript inicial foi de 301 para 250 kB
  gzip. Nesse intervalo saíram o framer-motion e as últimas seções de cliente (Projetos, Trajetória e
  Contato), então o ganho é das duas mudanças juntas.

### 2.4 A imagem principal (o elemento de LCP depois da mudança)

O Hero ganhou uma imagem decorativa grande (a cena dos blocos), com uma versão para o tema claro e
outra para o escuro. Ela virou o novo elemento de LCP e passou por três versões:

1. **`next/image` com `loading="lazy"`, uma por tema:** LCP de 3,7 s, com **1,9 s de atraso de
   carga**. O carregamento preguiçoso fazia o navegador esperar o layout para pedir a imagem que é
   justamente a maior da tela. *Lição: nunca use `lazy` no elemento de LCP.*
2. **Imagem de fundo em CSS, uma regra por tema** (`.hero-scene` e `.dark .hero-scene`): o navegador
   descobre a imagem junto com o CSS e **baixa só a do tema ativo**, sem JavaScript. O tempo de carga
   da imagem caiu para 24 ms.
3. **Pré-carga com prioridade alta** (`preload(url, { as: "image", fetchPriority: "high" })`, API do
   React 19): todo visitante novo entra no tema escuro, então a versão escura é pré-carregada.
   **Atraso de carga de 1,35 s para 0,47 s.** Quem prefere o tema claro paga 34 kB a mais, uma vez.

**Detalhe de qualidade que virou detalhe de formato:** em WebP com perdas, o fundo da imagem desviava
1 ou 2 tons do fundo da página e deixava um retângulo visível em volta da cena. A solução foi WebP
**sem perdas** (34 e 40 kB, contra 104 e 113 kB do PNG original), servido sem recodificação.

### 2.5 Imagens

| Imagem | Antes | Depois |
|---|---|---|
| Cena escura (Hero) | 104 kB PNG | 34 kB WebP sem perdas |
| Cena clara (Hero) | 113 kB PNG | 40 kB WebP sem perdas |
| Captura do CurrículoRaiz | 406 kB PNG | 72 kB WebP |

As capturas dos projetos usam `next/image` com `sizes` corretos, então o celular recebe uma versão
menor (a da página de 390 px pede a imagem de 384 ou 750 px de largura).

### 2.6 Fontes

- Três famílias (Bricolage Grotesque, Instrument Sans e JetBrains Mono) pelo `next/font/google`:
  **servidas pelo próprio site**, sem requisição a servidores do Google no navegador do visitante.
- Só o subconjunto `latin`, que cobre português, inglês e espanhol.
- Só as duas primeiras são pré-carregadas. A monoespaçada, usada em rótulos pequenos, não.
- `display: swap` com o ajuste automático da fonte reserva do `next/font`: o texto aparece logo, e a
  troca não move o layout. **CLS 0** em todas as medições.
- **Custo:** 136 kB de fontes, sendo 75 kB só da Bricolage variável (eixos de peso e de tamanho óptico).

#### Experimento: cortar a fonte dos títulos (medido e descartado)

| Versão da Bricolage | Peso | Aparência | LCP com limitação real |
|---|---|---|---|
| Variável completa (a aprovada) | 75 kB | a aprovada | 1,9 s |
| Pesos fixos 700 e 800 (Google) | 41 kB | títulos gigantes mais largos e genéricos | não medido¹ |
| Recorte próprio: pesos 700 a 800 variáveis, tamanho óptico fixo em 96 (HarfBuzz) | 31 kB | igual nos títulos grandes, um pouco mais justa nos pequenos | 1,9 s |

¹ Medida só no simulado, que oscilou (2,6 a 2,9 s), e descartada pela mudança visual.

Como fiz o recorte: o pacote `subset-font` (HarfBuzz) gera um WOFF2 só com os caracteres latinos,
restringe o eixo de peso a 700–800 e fixa o tamanho óptico em 96, o valor que a fonte variável já usa
nos títulos grandes. O arquivo entra pelo `next/font/local`.

**Decisão: fiquei com a fonte variável completa.** O recorte economizava 44 kB, mas o LCP medido com
limitação real foi o mesmo (1,9 s), porque a imagem principal já carrega em paralelo, e os títulos
pequenos mudavam de forma. *Lição: bytes a menos que não mudam a métrica do usuário não justificam
mudar a identidade aprovada.*

### 2.7 Mandar ao navegador só as traduções que ele usa

- **Problema:** o provedor do next-intl recebia **todas** as mensagens dos três blocos de conteúdo e as
  serializava no HTML, embora só o cabeçalho e o formulário usassem traduções no cliente.
- **Solução:** o layout passa ao provedor só os grupos `nav`, `language`, `theme`, `accessibility` e
  `contact`.
- **Resultado:** o HTML da página foi de 129 kB, no início da change, para 117 kB, no fim do bloco 5.
  Parte do ganho vem desta mudança, e parte das seções que passaram a ser de servidor.

### 2.8 Validação do formulário sob demanda

- **Problema:** o maior pedaço de JavaScript da página (64 kB gzip) era quase todo Zod, usado só para
  validar um formulário que fica recolhido e que a maioria dos visitantes nunca abre.
- **Solução:** os campos continuam no HTML, prontos. Só as regras de validação moram num módulo
  separado (`lib/contact-validation.ts`), importado com `import()` dentro do resolvedor:

  ```ts
  const loadValidation = () => import("@/lib/contact-validation");

  const resolver: Resolver<ContactFormData> = async (values, context, options) => {
    const { createContactResolver } = await loadValidation();
    return createContactResolver(messages)(values, context, options);
  };
  ```

  A pré-carga começa no **primeiro foco** dentro do formulário (`onFocus` no `<form>`), então, quando a
  pessoa termina de digitar e envia, o módulo já chegou.
- **Resultado:** JavaScript inicial de 250 para **224 kB gzip** (−26 kB).

#### O que tentei e descartei (ótimo exemplo para entrevista)

Antes, tentei carregar **o formulário inteiro** sob demanda, com `next/dynamic` e `ssr: false`, só
quando o `<details>` abrisse. Economizava mais (212 kB), mas o formulário levava de **200 a 300 ms**
para aparecer. No teste de teclado, quem apertava Enter para abrir e logo Tab pulava o formulário
inteiro e caía num link do rodapé. Isso quebrava um requisito de acessibilidade ("o próximo Tab vai
para o campo Nome"). **Troquei 12 kB por acessibilidade.**

> Frase de entrevista: "otimização que quebra o uso por teclado não é otimização. Medi o tempo até o
> formulário aparecer, vi a regressão no teste de teclado e mudei a fronteira do carregamento sob
> demanda: em vez do componente, só a biblioteca de validação."

### 2.9 Nada que custe JavaScript para coisas que o HTML resolve

- A troca de idioma virou **três links** (PT, EN, ES) em vez de um menu suspenso com estado: funciona
  sem JavaScript.
- O formulário fica num `<details>` nativo: abre por teclado e anuncia "expandido" sem nenhuma linha
  de JavaScript.
- O rodapé é de servidor, e "Voltar ao topo" é um link de âncora.
- A régua da carreira (barras posicionadas pelas datas) é **calculada no servidor** por uma função
  pura testada, e as barras crescem com `transform: scaleX` em CSS.

---

### 2.10 Cena 3D sem pesar no carregamento (change `cena-3d-e-transicao-de-tema`)

O Hero ganhou uma cena 3D realista (notebook, tablet e celular em Three.js, com o CurrículoRaiz nas telas).
O desafio era pôr 3D de verdade sem piorar nenhum número do carregamento.

- **Fora do pacote inicial:** a cena vive num módulo carregado com `import()` dinâmico. O pedaço tem **136 kB
  gzip** (Three.js, `RoundedBoxGeometry`, `RoomEnvironment` e o código da cena) e não aparece no HTML. O
  JavaScript inicial foi de 224 para 225 kB (só o carregador).
- **Portão antes de baixar:** uma função pura decide se a cena pode rodar (movimento reduzido, WebGL, economia de
  dados, menos de 4 GB de memória ou de 4 núcleos). Se não puder, nem um byte do Three.js é baixado. Ela tem
  teste de unidade para cada condição.
- **Imagem de reserva gerada pela própria cena:** um script abre o site em modo de captura e salva o canvas
  parado, com fundo transparente. A troca imagem → cena fica imperceptível (0,1% de pixels diferentes) e quem não
  roda 3D vê a mesma composição, parada.
- **Pausa fora da tela:** `IntersectionObserver` e `visibilitychange` param o laço de quadros e o vídeo da tela.

#### Dois problemas que a medição encontrou

1. **A imagem de reserva é o elemento de LCP.** Gerada a 2× e qualidade 0,8, ela foi de 34 para **59 kB**, e o LCP
   subiu de **1,9 para 2,4 s** (o tempo de carga dela, no 4G lento, foi de 1,2 para 1,7 s). Gerando a 1,5× e
   qualidade 0,7, ela ficou com **40 kB** e o LCP voltou para cerca de 2,0 a 2,2 s. *Lição: qualquer mudança no
   elemento de LCP precisa ser medida, por menor que pareça.*
2. **Montar a cena logo depois do carregamento travava a página.** No Chrome do Lighthouse, que não tem placa de
   vídeo, o WebGL roda na CPU, e o bloqueio total foi a **11 s**. A cena passou a começar na **primeira
   interação** (mexer o mouse, rolar, tocar ou usar o teclado), com o Hero perto da tela. No computador, quase todo
   mundo mexe o mouse no primeiro segundo, então a experiência quase não muda, e a montagem nunca disputa o
   carregamento inicial.

#### Como provei que não houve regressão (comparação A/B)

Os números absolutos do Lighthouse variam com a carga da máquina: a mesma página deu bloqueio de 110 ms num
momento e de 700 ms em outro. Para não confundir ruído com regressão, subi a versão anterior (de um commit
antigo, numa cópia temporária do repositório) ao lado da atual e medi as duas **alternadamente**, na mesma hora:

| Versão | LCP | Bloqueio total |
|---|---|---|
| Antes da cena 3D | 2,2 a 2,3 s | 660 a 1.060 ms |
| Com a cena 3D | 2,1 a 2,3 s | 520 a 910 ms |

Mesmas condições, mesmos números: a cena não piorou o carregamento.

> Frase de entrevista: "quando uma métrica muda, eu não comparo com um número de outro dia. Subo as duas versões
> lado a lado e meço alternadamente; assim o ruído da máquina afeta as duas igual."

### 2.11 Transição de tema com 0 kB

A troca entre claro e escuro virou um círculo que nasce no botão, com a **View Transitions API** do navegador:
`document.startViewTransition` captura a tela antiga e a nova, e um `clip-path: circle()` animado revela a nova.
Custo: cerca de 1 kB de código e nenhuma biblioteca. Com movimento reduzido ou num navegador sem a API, a troca é
instantânea, como antes.

### 2.12 Formulário sem bibliotecas (change `refinamentos-da-revisao`)

- **Problema:** o formulário dependia de `react-hook-form`, `zod` e `@hookform/resolvers`. Mesmo com a validação
  sob demanda (seção 2.8), eram três dependências e um pedaço extra de JavaScript para quatro campos.
- **Solução:** as regras viraram uma função pura, `lib/contact/validate.ts`. Ela devolve códigos de erro (`name_min`,
  `email_invalid`…), não textos, e o componente traduz os códigos com `messages/`. O estado é um `useState` comum. A
  lista de assunto com ícones é um componente próprio, no padrão "select-only combobox" da APG. O mesmo módulo de
  regras vai servir à rota da API.
- **Resultado:** JavaScript inicial de **225 para 216 kB gzip** (−9 kB), medido como na seção 1. O pedaço de
  validação que era baixado no primeiro foco do formulário deixou de existir.
- **Para a entrevista:** "Primeiro, adiei a biblioteca (carregar sob demanda). Depois, perguntei se ela era
  necessária. Para quatro campos, a plataforma e uma função pura bastam, e a mesma função roda no servidor."

### 2.13 Luz da tela sem a luz de área do Three.js

- **Problema:** o dono pediu que a tela do notebook iluminasse o teclado. O caminho óbvio, `RectAreaLight`, exige
  as tabelas de `RectAreaLightTexturesLib`, com **110 kB gzip**. Isso quase dobraria o pedaço da cena (136 kB).
- **Solução:** um `SpotLight` embutido, saindo da tela, e um brilho aditivo pintado na base. Os dois acompanham a
  cor média da tela, lida a cada 2 s num canvas de 4 × 4 px (a luz desliza até o tom novo; antes era a cada 500 ms,
  e cada leitura de quadro do vídeo trava a placa de vídeo por um instante), e somem quando a tampa fecha.
- **Resultado:** o pedaço da cena foi de 136 para 137,5 kB gzip, já contando o notebook novo inteiro. Os pôsteres
  gerados de novo ficaram menores (37 e 35 kB, antes 41 e 40 kB).

### 2.14 Logotipos numa folha de símbolos (change `secao-de-tecnologias`)

- **Problema:** a seção de competências passou a mostrar cada tecnologia com logotipo. Como SVG inline, cada idioma
  carregaria os caminhos de todos os desenhos dentro do HTML, e de novo no payload do React.
- **Solução:** uma folha de símbolos, `public/icons/tech.svg`, usada com `<svg><use href="/icons/tech.svg#si-react">`.
  O HTML leva só a referência, o arquivo vem uma vez para os três idiomas, e o ícone herda `currentColor`, então o
  hover troca a cor por CSS. A folha é gerada por `scripts/tech-icons/build.mjs` a partir do Simple Icons, baixado à
  parte: nenhuma dependência nova.
- **Menos também é desempenho:** a primeira versão tinha uma faixa animada com os logotipos repetidos e 51
  tecnologias. Na revisão, o dono achou a seção poluída. A faixa saiu e a lista foi para 32 itens, com o resto numa
  linha de texto. Ao todo, o HTML de `/pt` tinha passado de 125 para 187 kB bruto; depois do corte, ficou em 151 kB.
- **Resultado (build de produção):**
  - JavaScript inicial: **216 kB gzip, sem mudança**. O movimento é CSS, e a ilha do brilho é mínima.
  - Folha de logotipos: **47 kB, ou 19 kB com gzip**, fora do HTML. O Next a serve com revalidação por ETag.
  - HTML de `/pt`: **125 → 151 kB bruto (23 kB com gzip)**.
- **Para a entrevista:** "Inline é ótimo para um ícone. Para dezenas, uma folha externa com `<use>` deixa o HTML
  leve, aproveita o cache e mantém a cor no CSS. E cortar o que não informa foi a otimização que mais rendeu."

### 2.15 Logomarca em assinatura: escrita letra a letra sem JavaScript

- **Problema:** a logomarca virou uma assinatura desenhada (temporária, a partir da fonte Mrs Saint Delafield,
  OFL), com uma animação de escrita e um brilho que passa de tempos em tempos. O cabeçalho é um componente de
  cliente: o desenho, importado ali, iria parar no JavaScript.
- **Primeira versão (descartada pelo efeito, não pelo peso):** o SVG como **máscara CSS** sobre `currentColor`.
  Custava 3,8 kB com gzip num arquivo em cache e nada no HTML, mas a máscara é um bloco só: dava para revelar da
  esquerda para a direita, não para escrever letra por letra.
- **Versão final:**
  - `Signature` é um **componente de servidor** passado ao cabeçalho como prop (`<Navbar logo={<Signature />} />`).
    O desenho vai no HTML, e o JavaScript não ganha nenhum byte.
  - Uma letra por `<path>` com `pathLength="1"`. A escrita anima `stroke-dashoffset` (o contorno é traçado) e
    depois `fill-opacity`, com atraso por letra. O sublinhado é um traço desenhado do mesmo jeito.
  - O brilho é um retângulo com degradê que cruza a assinatura, recortado pelas letras (`clipPath`). O recorte
    reaproveita as letras com `<use>`, sem repetir os desenhos: 194 → 177 kB de HTML bruto.
  - Tudo em CSS, desligado com movimento reduzido. No alto contraste do sistema, a cor vira `CanvasText`.
- **Resultado (build de produção):** JavaScript inicial **216 kB, sem mudança**. HTML de `/pt`: **151 → 177 kB bruto
  (23 → 33 kB com gzip)**. O desenho aparece duas vezes no documento, no HTML e no payload do React, longe demais uma
  da outra para o gzip aproveitar (janela de 32 kB).
- **Para a entrevista:** "Componente de servidor passado como prop para um componente de cliente é o jeito de pôr
  conteúdo pesado e estático dentro de uma ilha interativa sem que ele entre no bundle."

### 2.16 Tema sem `next-themes`

- **Problema:** o `ThemeProvider` do `next-themes` desenha um `<script>` dentro de um componente de cliente para
  aplicar o tema antes da pintura. O React 19 avisa no console de desenvolvimento ("Encountered a script tag while
  rendering React component"), e a biblioteca não tem versão nova desde março de 2025.
- **Primeira tentativa (não serviu):** `next/script` com `strategy="beforeInteractive"`. No App Router, o script
  inline só roda quando o JavaScript do Next carrega, e não antes da primeira pintura: o `<html>` chegava sem a classe
  do tema, o que faria a página piscar.
- **Segunda tentativa (só meio certa):** um `<script>` no `<head>` do layout de servidor. Na primeira carga funciona:
  o navegador executa o script ao ler o HTML, antes de pintar. Mas trocar de idioma redesenha o layout no navegador,
  sem recarregar, e aí o React **cria** o `<script>` de novo, e o aviso voltou. O teste mostrou um segundo problema
  que o `next-themes` escondia: nesse redesenho o React refaz o `<html>` e a classe do tema some.
- **Solução:** um componente `ThemeScript` (`components/layout/ThemeScript.tsx`):
  - no HTML do servidor, é um script comum, que roda antes da primeira pintura;
  - no navegador, renderiza `type="text/plain"` (com `suppressHydrationWarning` só nesse atributo), então o React
    nunca cria um script executável e não há aviso;
  - um `useLayoutEffect` reaplica o tema salvo antes da pintura sempre que o layout é redesenhado.
  O script e as constantes ficam em `lib/theme-script.ts`; o hook do botão (`useSyncExternalStore`, avisando de forma
  síncrona para funcionar dentro do `flushSync` da transição de tema) fica em `lib/theme.ts`. Um teste de navegador
  troca de idioma com o tema escuro salvo e confere a classe e o console.
- **Resultado:** uma dependência a menos, JavaScript inicial de **216 para 215 kB gzip**, e a classe do tema já está
  no `<html>` no `DOMContentLoaded`, antes da hidratação (conferido no navegador).
- **Para a entrevista:** "O jeito certo de evitar o flash de tema é rodar o script antes da primeira pintura, e no App
  Router isso significa um `<script>` no `<head>` renderizado pelo servidor, não um componente de cliente."

## 3. Desempenho e acessibilidade juntos

As mesmas decisões que aceleraram o site também o deixaram mais acessível:

- **Sem JavaScript, o conteúdo aparece inteiro**, porque o HTML do servidor é o estado final.
- **Movimento reduzido:** todo efeito fica dentro de `@media (prefers-reduced-motion: no-preference)`;
  com o pedido de movimento reduzido, nada se move e nada fica escondido.
- **Foco antes da animação:** um `focusin` revela na hora o bloco que recebe foco, para que ninguém
  navegue por teclado até um elemento ainda invisível.
- **Nota de acessibilidade do Lighthouse de 97 para 100**, e o axe passou de duas regras violadas
  (contraste e nome de link divergente do texto visível) para zero violações WCAG 2.2 AA.

---

## 4. Perguntas prováveis em entrevista

**"O que é LCP e como você melhorou?"**
Largest Contentful Paint: o tempo até o maior elemento visível aparecer. Meta: abaixo de 2,5 s no
celular. Primeiro olhei as fases do LCP. O atraso era de renderização, por causa de `opacity: 0` vindo
do servidor, e resolvi isso com o HTML final no servidor. Depois a imagem virou o LCP, o atraso passou
a ser de carga, por causa do `lazy`, e resolvi com fundo em CSS e pré-carga com prioridade alta.

**"Por que o LCP simulado não caiu tanto quanto o observado?"**
Porque o Lighthouse simula um 4G lento em que todos os recursos pedidos antes do LCP disputam a mesma
banda. Com a CPU resolvida, o gargalo virou bytes: JavaScript e fontes. Por isso os próximos passos são
cortar bytes, e não otimizar código.

**"Por que não usou GSAP, que é o padrão de sites premiados?"**
Porque os efeitos acontecem uma vez ao entrar na tela, e para isso CSS mais um `IntersectionObserver`
resolvem com 1 kB. GSAP custaria cerca de 45 kB e se justificaria com animação presa à rolagem, que
também não usei por acessibilidade (não sequestrar a rolagem).

**"Como você garante que a otimização não quebrou nada?"**
Testes automatizados a cada etapa: hidratação sem divergência nos três idiomas, testes de navegador
(Playwright) com axe, capturas de referência visuais e testes de teclado. Foi um teste de teclado que
me fez desistir de carregar o formulário inteiro sob demanda.

**"O que você faria a seguir?"**
1. Pôr o Lighthouse no CI, com limitação real, para cada mudança mostrar o efeito nas métricas.
2. Acompanhar dados de campo (Core Web Vitals de usuários reais) quando o site estiver publicado.
3. Na cena 3D, provar com medição que ela carrega depois do LCP e não muda o número.

---

## 5. Glossário rápido

- **LCP (Largest Contentful Paint):** tempo até o maior elemento visível aparecer. Bom: < 2,5 s.
- **CLS (Cumulative Layout Shift):** quanto o layout "pula" durante o carregamento. Bom: < 0,1.
- **INP (Interaction to Next Paint):** atraso da página em responder a cliques e teclas. Bom: < 200 ms.
  Em laboratório, o substituto é o **TBT** (Total Blocking Time), que soma o tempo em que a thread
  principal ficou bloqueada.
- **FCP (First Contentful Paint):** primeiro texto ou imagem na tela.
- **Hidratação:** o React "liga" o HTML vindo do servidor no navegador. Se o HTML do cliente for
  diferente do servidor, há divergência (erro).
- **React Server Components:** componentes que rodam só no servidor e mandam HTML, sem JavaScript
  para o navegador.
- **Lantern:** o simulador do Lighthouse que calcula o desempenho em rede e CPU lentas a partir de uma
  medição rápida.
- **`fetchPriority="high"`:** dica para o navegador baixar um recurso antes dos outros.
- **`IntersectionObserver`:** API do navegador que avisa quando um elemento entra na tela, sem
  escutar a rolagem a cada quadro.

---

## 6. Pendências (atualizar quando concluir)

- [x] LCP abaixo de 2,5 s nos três idiomas, com limitação real: 1,9 s em pt, en e es.
- [x] Medição final do bloco 6 (`/pt`, `/en` e `/es`), anotada no resumo.
- [ ] Lighthouse CI no GitHub Actions (bloco 7 de `fundacao-stack-e-qualidade`).
- [x] Cena 3D (change `cena-3d-e-transicao-de-tema`): carrega por `import()` na primeira interação, pausa fora
  da tela, e a comparação A/B mostrou que o LCP e o bloqueio não pioraram (seção 2.10).
- [ ] Medir de novo com a máquina ociosa, para registrar números absolutos sem ruído.
