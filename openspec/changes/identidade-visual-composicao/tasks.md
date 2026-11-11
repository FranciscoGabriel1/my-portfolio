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
- [ ] 1.12 Dono confere no navegador: cabeçalho e rodapé novos, paleta e fontes novas nas seções antigas, pt/en/es, claro/escuro, menu de celular só com teclado

## 2. Hero e Sobre

- [ ] 2.1 Converter `cena-blocos-escuro.png` e `cena-blocos-claro.png` em WebP/AVIF otimizados (até 80 kB cada) em `public/images/scene/`
- [ ] 2.2 Hero como componente de servidor: situação, nome com `SplitText` animado ao carregar só com CSS, frase de posicionamento, "Ver projetos" e "Baixar CV", lista "Onde já construí" e as duas imagens da cena por tema (decisão 9)
- [ ] 2.3 Sobre como componente de servidor: texto, quatro fatos e competências agrupadas, com `data-reveal`
- [ ] 2.4 Textos do Hero e do Sobre em `messages/pt.json` só com dados reais; "remoto" e qualquer item das Open Questions ficam fora até o dono confirmar; `npm run translate` e revisão
- [ ] 2.5 Remover do Hero os contadores, o cargo alternando e as partículas
- [ ] 2.6 Medir o LCP celular com o nome animado e com o nome parado; se a diferença passar de 100 ms, deixar o nome parado (decisão 3) e anotar o resultado aqui
- [ ] 2.7 Lint, tipos, testes e build; dono confere Hero e Sobre em pt/en/es, claro/escuro, 1440 e 390, e com movimento reduzido

## 3. Projetos

- [ ] 3.1 Criar `lib/content/projects.ts` com id, URL, GitHub, imagem e dimensões, stack, contexto e destaque; mover esses dados para fora de `messages/*.json`, deixando só texto
- [ ] 3.2 Teste de unidade: todo projeto de `lib/content` tem título e descrição nos três idiomas, e nenhuma mensagem guarda caminho ou URL
- [ ] 3.3 Adicionar o CurrículoRaiz (fatos públicos e stack do código do produto), com a imagem otimizada em `public/images/projects/`
- [ ] 3.4 Seção Projetos como componente de servidor: caso em destaque (imagem, papel, descrição, stack e link) e lista numerada dos demais; links externos com o texto visível seguido de "abre em nova aba" só para leitor de tela; projeto sem URL fica sem link
- [ ] 3.5 Remover o filtro por categoria, `Card`, `Badge` de categoria e o componente de projetos antigo
- [ ] 3.6 Textos em pt, `npm run translate` e revisão; lint, tipos, testes e build
- [ ] 3.7 Dono confere Projetos e escolhe o destaque (CurrículoRaiz ou HostGator)

## 4. Trajetória

- [ ] 4.1 Criar `lib/content/career.ts` (empresa, cargo, local, regime, início e fim em `AAAA-MM`, atual) e mover os dados estruturais da experiência e da formação para fora das mensagens
- [ ] 4.2 Função pura do período para posição na régua, com testes usando as datas reais (Atem de mai 2022 a mai 2025, HostGator de out 2025 até o mês do build)
- [ ] 4.3 Seção Trajetória como componente de servidor: régua `aria-hidden` (oculta abaixo de 900 px) com barras que crescem em sequência, lista ordenada das experiências e formação
- [ ] 4.4 Textos em pt (sem a frase das sobreposições até o dono confirmar), `npm run translate` e revisão; lint, tipos, testes e build
- [ ] 4.5 Dono confere a Trajetória em 1440 e 390, e com movimento reduzido

## 5. Contato e limpeza

- [ ] 5.1 Criar `lib/contact.ts` com `AGENDA_URL` vazio; "Agendar call" no cabeçalho e no Contato só quando houver URL
- [ ] 5.2 Seção Contato: cartões dos canais (e-mail, LinkedIn, GitHub, Lattes, Discord) com rótulo e valor visível, "Baixar CV" e formulário em `<details>` "Prefere escrever por aqui?", sem mudar a lógica do formulário nem a API
- [ ] 5.3 Campos do formulário com `--line-strong` e foco com `--focus`; erro de validação mantém o `<details>` aberto
- [ ] 5.4 Remover `framer-motion` do `package.json` e os componentes `Particles`, `CountUp`, `FadeInView`, `StaggerChildren` e `SectionDivider`, além dos aliases de tokens antigos
- [ ] 5.5 Textos em pt, `npm run translate` e revisão; lint, tipos, testes e build
- [ ] 5.6 Dono confere o Contato, o formulário só com teclado e o comportamento com e sem link de agendamento

## 6. Verificação e entrega

- [ ] 6.1 Teste de navegador com JavaScript desligado: todas as seções visíveis e links funcionando, em pt/en/es
- [ ] 6.2 Teste de navegador com movimento reduzido: nenhum elemento com `transform` ou opacidade parcial depois do carregamento
- [ ] 6.3 Teste de navegador: Tab até um link abaixo da dobra deixa o link visível; o menu de celular abre e fecha só com teclado
- [ ] 6.4 Teste que procura "validar", "preencher" e "Lorem" no HTML gerado das três páginas
- [ ] 6.5 Tirar `color-contrast` e `label-content-name-mismatch` de `tests/e2e/a11y-known-violations.ts`; axe sem violações WCAG 2.2 AA em pt/en/es, claro/escuro, 1440 e 390
- [ ] 6.6 Regerar as capturas de referência (`npm run test:e2e:update`) depois da aprovação do dono, e atualizar `tests/e2e/screenshot.css` para o Hero novo
- [ ] 6.7 Lighthouse celular em `/pt`, `/en` e `/es` dentro do orçamento (LCP < 2,5 s, CLS < 0,1, bloqueio < 200 ms) e JavaScript da rota menor que o da tarefa 1.1; anotar os números
- [ ] 6.8 Conferência manual no Chrome: pt/en/es, claro/escuro, celular e computador, só teclado, leitor de tela (Orca) no Hero, Projetos e Contato, movimento reduzido e WebGL desligado (`--disable-webgl`)
- [ ] 6.9 `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` e `npm run test:e2e` verdes
- [ ] 6.10 Atualizar `README.md` (stack sem framer-motion, fontes, seções) e `CLAUDE.md` (lacunas resolvidas: contraste, movimento reduzido); rodar `graphify update .`
