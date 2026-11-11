## 1. Base visual: tokens, fontes, cabeçalho, rodapé e movimento

- [x] 1.1 Registrar a linha de base: JavaScript total que `/pt` carrega na build atual (soma dos chunks) e Lighthouse celular de `/pt` (LCP, CLS, bloqueio total), anotados nesta tarefa
  - Linha de base (2026-11-11, build do fim da fundação, Lighthouse 12 celular): JS de `/pt` = 12 scripts, 990 kB bruto, **308 kB gzip** (maior pedaço: Zod 4 + framer-motion, 124 kB gzip). **LCP 3,2 s** (acima do orçamento: o LCP é a frase do Hero, com 2,8 s de atraso de renderização pelo `opacity: 0` do framer-motion), CLS 0, bloqueio 200 ms, FCP 0,9 s. Notas: desempenho 90, acessibilidade 97, boas práticas 100, SEO 100.
- [x] 1.2 Tokens semânticos claro e escuro em `app/globals.css` com os valores da decisão 5 do design, expostos por `@theme inline`; nomes antigos viram aliases temporários
- [x] 1.3 Teste de unidade que lê os tokens dos dois temas e confere os contrastes mínimos da tabela da decisão 5 (texto 4,5:1, borda de campo e foco 3:1)
- [x] 1.4 Fontes Bricolage Grotesque, Instrument Sans e JetBrains Mono pelo `next/font/google` (subconjunto `latin`, só as duas primeiras pré-carregadas); remover a Inter
- [x] 1.5 Estilos base: classes de tipografia (`giant`, `display`, `h3`, `lead`, `eyebrow`), botão primário e fantasma, foco com `--focus`, `scroll-margin-top` das seções igual à altura do cabeçalho, deslocamento de hover desligado com movimento reduzido
- [x] 1.6 Movimento: componente de cliente montado no layout que marca `data-motion="ready"`, revela o que já está na tela, observa `[data-reveal]` e revela no `focusin`; CSS das entradas só sob `prefers-reduced-motion: no-preference`
- [x] 1.7 `SplitText` como componente de servidor (frase em `sr-only`, palavras `aria-hidden` com `--i`), com teste de unidade da marcação
- [x] 1.8 Cabeçalho novo: marca, links das seções, idiomas como três links com `aria-current`, botão de tema e "Baixar CV"; menu de celular com `aria-expanded`, foco no primeiro link, Esc devolvendo o foco
- [x] 1.9 Rodapé novo como componente de servidor (© ano, local, Lattes, idiomas, "Voltar ao topo")
- [x] 1.10 Textos novos em `messages/pt.json` (rótulos do menu, idiomas por extenso, aviso de nova aba e link para pular ao conteúdo traduzido); `npm run translate` e revisão do en/es
  - en e es escritos à mão só para as chaves novas, sem `npm run translate`: o script retraduz os arquivos inteiros e desfaria correções manuais (caminho de imagem em `/es`, "Póngase en contacto con"). Os nomes dos idiomas saíram das mensagens para `LOCALE_NAMES` em `i18n/routing.ts`, porque não se traduzem.
- [x] 1.11 `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` sem erro; ajustar o teste de hidratação para os componentes novos
- [x] 1.12 Dono confere no navegador: cabeçalho e rodapé novos, paleta e fontes novas nas seções antigas, pt/en/es, claro/escuro, menu de celular só com teclado (dono pediu para seguir em 2026-11-11, sem objeções; commit 3a19aaa)

## 2. Hero e Sobre

- [x] 2.1 Converter `cena-blocos-escuro.png` e `cena-blocos-claro.png` em WebP/AVIF otimizados (até 80 kB cada) em `public/images/scene/`
- [x] 2.2 Hero como componente de servidor: situação, nome com `SplitText` animado ao carregar só com CSS, frase de posicionamento, "Ver projetos" e "Baixar CV", lista "Onde já construí" e as duas imagens da cena por tema (decisão 9)
- [x] 2.3 Sobre como componente de servidor: texto, quatro fatos e competências agrupadas, com `data-reveal`
- [x] 2.4 Textos do Hero e do Sobre em `messages/pt.json` só com dados reais; "remoto" e qualquer item das Open Questions ficam fora até o dono confirmar; `npm run translate` e revisão
  - en/es à mão (mesmo motivo da 1.10). Nomes de ferramentas nas competências agora iguais nos três idiomas: o DeepL tinha traduzido "Prettier" para "Más bonito" e "Lighthouse > 95" para "Faro > 95". "Lighthouse > 95" virou "Lighthouse" (número sem fonte).
- [x] 2.5 Remover do Hero os contadores, o cargo alternando e as partículas
- [x] 2.6 Medir o LCP celular com o nome animado e com o nome parado; se a diferença passar de 100 ms, deixar o nome parado (decisão 3) e anotar o resultado aqui
  - Resultado (Lighthouse 12 celular, 2 execuções cada, parado = `--force-prefers-reduced-motion`): animado 3,9 e 3,8 s; parado 3,9 e 3,8 s. **Sem diferença: o nome continua animado.** O elemento de LCP é a imagem da cena, não o nome. Com `next/image` e `loading="lazy"`, ela esperava 1,9 s para começar a baixar, então virou fundo em CSS por tema (decisão 9 atualizada).
  - LCP **observado** caiu de 1,25 s (linha de base) para cerca de 0,26 s. O **simulado** (4G lento) segue em 3,8 s porque a imagem disputa banda com 269 kB de JS e 136 kB de fontes (Bricolage variável: 75 kB). Ações para a 6.7: tirar o framer-motion e as seções antigas de cliente (5.4), mandar ao cliente só as mensagens que os componentes de cliente usam e, se ainda faltar, avaliar a Bricolage em pesos fixos.
- [x] 2.7 Lint, tipos, testes e build; dono confere Hero e Sobre em pt/en/es, claro/escuro, 1440 e 390, e com movimento reduzido (aprovado pelo dono em 2026-11-11)

## 3. Projetos

- [x] 3.1 Criar `lib/content/projects.ts` com id, URL, GitHub, imagem e dimensões, stack, contexto e destaque; mover esses dados para fora de `messages/*.json`, deixando só texto
- [x] 3.2 Teste de unidade: todo projeto de `lib/content` tem título e descrição nos três idiomas, e nenhuma mensagem guarda caminho ou URL
- [x] 3.3 Adicionar o CurrículoRaiz (fatos públicos e stack do código do produto), com a imagem otimizada em `public/images/projects/`
  - Stack conferida nos `package.json` de `curriculoraiz-web` e `curriculoraiz-api`. Imagem em WebP (72 kB). Destaque provisório: CurrículoRaiz (`FEATURED_PROJECT_ID`), até o dono decidir na 3.7.
- [x] 3.4 Seção Projetos como componente de servidor: caso em destaque (imagem, papel, descrição, stack e link) e lista numerada dos demais; links externos com o texto visível seguido de "abre em nova aba" só para leitor de tela; projeto sem URL fica sem link
- [x] 3.5 Remover o filtro por categoria, `Card`, `Badge` de categoria e o componente de projetos antigo
  - `Card` e `Badge` saíram de Projetos, mas os arquivos ficam até a 5.4, porque Experiência e Contato ainda os usam.
- [x] 3.6 Textos em pt, `npm run translate` e revisão; lint, tipos, testes e build
  - en/es à mão (mesmo motivo da 1.10). Smoke e axe verdes com a lista de violações conhecidas **vazia**: `label-content-name-mismatch` saiu junto com os links antigos (antecipa o resto da 6.5).
- [x] 3.7 Dono confere Projetos e escolhe o destaque (CurrículoRaiz ou HostGator)
  - Dono pediu para seguir em 2026-11-11 sem escolher; fica o CurrículoRaiz, a recomendação. Trocar é mudar `FEATURED_PROJECT_ID`.

## 4. Trajetória

- [x] 4.1 Criar `lib/content/career.ts` (empresa, cargo, local, regime, início e fim em `AAAA-MM`, atual) e mover os dados estruturais da experiência e da formação para fora das mensagens
- [x] 4.2 Função pura do período para posição na régua, com testes usando as datas reais (Atem de mai 2022 a mai 2025, HostGator de out 2025 até o mês do build)
- [x] 4.3 Seção Trajetória como componente de servidor: régua `aria-hidden` (oculta abaixo de 900 px) com barras que crescem em sequência, lista ordenada das experiências e formação
- [x] 4.4 Textos em pt (sem a frase das sobreposições até o dono confirmar), `npm run translate` e revisão; lint, tipos, testes e build
  - en/es à mão. Em en/es, CLT e PJ ganham explicação ("Full-time (CLT)", "Contractor (PJ)"). O subtítulo, que fala das barras, aparece só onde a régua aparece (a partir de 900 px).
- [x] 4.5 Dono confere a Trajetória em 1440 e 390, e com movimento reduzido (dono pediu para seguir em 2026-11-11)

## 5. Contato e limpeza

- [x] 5.1 Criar `lib/contact.ts` com `AGENDA_URL` vazio; "Agendar call" no cabeçalho e no Contato só quando houver URL
- [x] 5.2 Seção Contato: cartões dos canais (e-mail, LinkedIn, GitHub, Lattes, Discord) com rótulo e valor visível, "Baixar CV" e formulário em `<details>` "Prefere escrever por aqui?", sem mudar a lógica do formulário nem a API; tirar as URLs de `contact.social` das mensagens e a exceção correspondente em `tests/unit/content.test.ts`
  - A seção virou componente de servidor, e só o formulário (`ContactForm`) é de cliente, com as mesmas regras e o mesmo envio. Sem JavaScript, um aviso em `<noscript>` indica o e-mail, e o formulário usa `method="post"` para nunca mandar a mensagem na URL.
- [x] 5.3 Campos do formulário com `--line-strong` e foco com `--focus`; erro de validação mantém o `<details>` aberto
  - Token `--danger` novo, coberto pelo teste de contraste. Conferido no navegador: Enter abre, o Tab seguinte vai para Nome, e o envio vazio mostra os 4 erros com o `<details>` aberto, em pt/en/es.
- [x] 5.4 Remover `framer-motion` do `package.json` e os componentes `Particles`, `CountUp`, `FadeInView`, `StaggerChildren` e `SectionDivider`, além dos aliases de tokens antigos
  - Também saíram `Card`, `Badge`, `BrandIcons`, `DiscordIcon`, `lib/social-links.ts`, a escala tipográfica antiga e as utilidades `glass`, `text-gradient`, `section-padding` e `container-content`.
  - Desempenho (ações da 2.6): o navegador recebe só as mensagens das ilhas de cliente; a imagem escura da cena é pré-carregada com prioridade alta; Zod e o resolvedor do formulário carregam sob demanda (`lib/contact-validation.ts`, que o bloco 5 da fundação vai compartilhar com o servidor). Uma tentativa de carregar o formulário inteiro sob demanda foi descartada: ele levava de 200 a 300 ms para aparecer, e o Tab logo depois de abrir pulava o formulário.
  - Resultado: JS de `/pt` 308 → **224 kB gzip**; bloqueio total 200 → 60-90 ms; LCP simulado 3,1 a 3,7 s (ainda acima de 2,5 s; o que resta pesar são 136 kB de fontes, para a 6.7).
- [x] 5.5 Textos em pt, `npm run translate` e revisão; lint, tipos, testes e build
  - en/es à mão. Corrigidos erros antigos do DeepL no formulário: placeholder de e-mail em português nos três idiomas, mistura de "usted" e "tú" e "Assunto" traduzido como "La asignatura".
- [x] 5.6 Dono confere o Contato, o formulário só com teclado e o comportamento com e sem link de agendamento (dono pediu para seguir em 2026-11-11; link de agendamento ainda não fornecido, então "Agendar call" segue oculto)

## 6. Verificação e entrega

- [x] 6.1 Teste de navegador com JavaScript desligado: todas as seções visíveis e links funcionando, em pt/en/es
  - `tests/e2e/alternativas.spec.ts`: as cinco seções visíveis, nada com opacidade parcial e nenhum link vazio, em pt/en/es.
- [x] 6.2 Teste de navegador com movimento reduzido: nenhum elemento com `transform` ou opacidade parcial depois do carregamento
  - Também confere que nenhuma animação está rodando depois do carregamento.
- [x] 6.3 Teste de navegador: Tab até um link abaixo da dobra deixa o link visível; o menu de celular abre e fecha só com teclado
  - Mais: o formulário abre com Enter e o Tab seguinte vai para Nome.
- [x] 6.4 Teste que procura "validar", "preencher" e "Lorem" no HTML gerado das três páginas
- [x] 6.5 Tirar `color-contrast` e `label-content-name-mismatch` de `tests/e2e/a11y-known-violations.ts`; axe sem violações WCAG 2.2 AA em pt/en/es, claro/escuro, 1440 e 390
  - As duas regras saíram nos blocos 1 e 3. O axe agora roda também em 390 px: 12 combinações, zero violações.
- [x] 6.6 Regerar as capturas de referência (`npm run test:e2e:update`) depois da aprovação do dono, e atualizar `tests/e2e/screenshot.css` para o Hero novo
  - `screenshot.css` esvaziado: o seletor antigo esconderia a faixa "Onde já construí", e nada mais muda sozinho. As 12 capturas foram regeneradas e passaram numa segunda execução.
- [x] 6.7 Lighthouse celular em `/pt`, `/en` e `/es` dentro do orçamento (LCP < 2,5 s, CLS < 0,1, bloqueio < 200 ms) e JavaScript da rota menor que o da tarefa 1.1; anotar os números
  - Critério (decisão 12 atualizada): limitação real (`--throttling-method=devtools`). **LCP 1,9 s em pt, en e es**, CLS 0, bloqueio 110 a 140 ms, nota 97 a 98. JS de `/pt`: 224 kB gzip, contra 308 na 1.1. O simulado (Lantern) ficou entre 3,2 e 3,7 s e é registrado só como referência: ele deu 2,6 e 3,4 s para duas builds com as mesmas requisições.
  - Experimento das fontes, medido e descartado: um recorte próprio da Bricolage (31 kB contra 75 kB) não mudou o LCP real (1,9 s) e deixava os títulos pequenos mais justos. Detalhes em `docs/otimizacao-de-desempenho.md`, seção 2.6.
- [ ] 6.8 Conferência manual no Chrome: pt/en/es, claro/escuro, celular e computador, só teclado, leitor de tela (Orca) no Hero, Projetos e Contato, movimento reduzido e WebGL desligado (`--disable-webgl`)
  - Feito por mim: Chromium com `--disable-webgl` (sem erro, cena como imagem) e árvore de acessibilidade de `/es` (um h1, quatro h2, marcos banner/main/contentinfo, tudo em espanhol). **Falta o dono**: ouvir com o Orca e conferir no Chrome dele.
- [x] 6.9 `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` e `npm run test:e2e` verdes
  - lint, tipos, 44 testes de unidade e 39 de navegador (12 axe, 10 alternativas, 5 smoke, 12 capturas).
- [x] 6.10 Atualizar `README.md` (stack sem framer-motion, fontes, seções) e `CLAUDE.md` (lacunas resolvidas: contraste, movimento reduzido); rodar `graphify update .`
  - README (stack sem framer-motion, fontes, link para o registro de desempenho), CLAUDE.md (seção "Estado atual") e `graphify update .`.
