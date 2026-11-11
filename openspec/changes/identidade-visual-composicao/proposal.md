## Why

A stack nova está pronta, mas o site continua com a cara antiga: azul genérico, partículas no Hero, números que não têm fonte ("30+ projetos"), texto `--text-muted` abaixo do contraste AA e animações que ignoram o movimento reduzido. O dono já aprovou a direção "Composição" olhando os protótipos no navegador: a estrutura de `design/prototipos/site-completo-*.html` com a linguagem de movimento do protótipo B (`design/prototipos/prototipo-b/`), fundo escuro `#141311` e acento laranja. Esta change leva essa direção para o código, sem o 3D, que vem na change seguinte.

## What Changes

- **Identidade nova no site inteiro:** paleta quente em tokens (escuro `#141311` e claro creme, os dois com contraste AA verificado), fontes Bricolage Grotesque (títulos), Instrument Sans (texto) e JetBrains Mono (rótulos) carregadas pelo `next/font`, no lugar da Inter. Sai o azul Apple, saem o vidro e o gradiente no texto.
- **Estrutura do protótipo aprovado**, nesta ordem: Hero, Sobre, Projetos, Trajetória e Contato, com cabeçalho e rodapé novos.
  - **Hero:** nome em tipografia gigante, frase de posicionamento, "Ver projetos" e "Baixar CV", faixa "Onde já construí" e a imagem pré-renderizada dos blocos (versão clara e escura). Saem as partículas, o cargo que alterna e os contadores, incluindo o "30+ projetos", que não tem fonte.
  - **Sobre:** texto novo, quatro fatos curtos (local, formação, cargo atual, produto próprio) e as competências agrupadas.
  - **Projetos:** um caso em destaque (CurrículoRaiz, a confirmar com o dono) e os demais em lista numerada. O CurrículoRaiz entra no site pela primeira vez. Sai o filtro por categoria.
  - **Trajetória:** régua animada com os períodos reais de 2019 até hoje, seguida da experiência detalhada e da formação.
  - **Contato:** canais em cartões (e-mail, LinkedIn, GitHub, Lattes, Discord), botão "Agendar call" que só aparece quando houver link de agendamento e formulário recolhido em "Prefere escrever por aqui?".
- **Linguagem de movimento do protótipo B, com rolagem nativa:** título revelado palavra por palavra, blocos que sobem ao entrar na tela e barras da régua que crescem. Tudo em CSS mais um único `IntersectionObserver`, sem biblioteca de animação. **Sai o `framer-motion`.**
- **Alternativas definidas:** sem JavaScript, o conteúdo aparece inteiro e estático; com movimento reduzido, nada se move e nada fica escondido. Sem WebGL e no celular fraco, a imagem dos blocos é a versão final até a change de 3D.
- **Acessibilidade das partes novas:** `aria-*` e textos de leitor de tela vindos de `messages/`, links externos avisam "abre em nova aba" sem `aria-label` divergente, foco visível com contraste nos dois temas e menu de celular operável por teclado.
- **Dados estruturais fora das traduções:** URLs, imagens, stack e datas dos projetos e da experiência passam de `messages/*.json` para `lib/content/`, e as mensagens guardam só o texto. Assim, a tradução automática não consegue mais quebrar caminhos de imagem, como aconteceu em `/es`.

O que o visitante percebe: um site com cara própria, quente e mais calmo, com menos elementos por tela. O nome entra palavra por palavra e as seções aparecem com suavidade ao rolar, sem a rolagem ser sequestrada. A régua mostra a carreira de relance. O CurrículoRaiz aparece como produto próprio. Quem quiser conversar marca uma call em dois cliques, se o link de agendamento existir. Com movimento reduzido ou sem JavaScript, o site é o mesmo, só que parado.

## Fora do escopo

- **Cena 3D em tempo real** (blocos que se montam com a rolagem, Three.js): change `cena-3d-montagem`, depois desta. Aqui o Hero usa só a imagem pré-renderizada, que continua sendo a alternativa da cena.
- **Recomendações do LinkedIn:** change própria quando o dono enviar os textos reais. Nada de texto de exemplo no site publicado.
- **SEO** (metadados por idioma, `sitemap`, `robots`, `hreflang`, imagem OG, JSON-LD): change `conteudo-no-servidor-e-seo`.
- **Segurança do formulário, cabeçalhos HTTP e CI:** blocos 5 a 7 da `fundacao-stack-e-qualidade`, que seguem depois desta. Aqui o formulário só muda de aparência e de lugar.
- **Problema e resultado de cada caso**, e os números de impacto: entram quando o dono fornecer, sem estimativa.
- Seções "Como eu trabalho" e "Perguntas de quem recruta" do protótipo B: o dono escolheu a estrutura do site completo.
- Efeitos de ambiente no fundo escuro (luz, granulação, grade): o dono decidiu deixar o preto chapado por enquanto.

## Capabilities

### New Capabilities
- `identidade-visual`: paleta, temas claro e escuro, tipografia, contraste mínimo de texto, bordas de campos e foco.
- `pagina-inicial`: as seções da página, o que cada uma mostra, a navegação, o menu de celular, o contato com agendamento e a regra de só publicar dado real.
- `movimento-e-alternativas`: as animações de entrada, o texto revelado por palavra e a régua, e o comportamento sem JavaScript, com movimento reduzido e sem WebGL.

### Modified Capabilities

(nenhuma: `openspec/specs/` ainda está vazio. As specs da fundação, como `formulario-de-contato`, continuam valendo, porque aqui o formulário só muda de aparência.)

## Impact

- **Código:** `app/globals.css` (tokens novos), `app/[locale]/layout.tsx` (fontes, script que marca JavaScript ativo, observador de revelação), `app/[locale]/page.tsx`, todas as seções de `components/sections/`, `components/layout/` (Navbar, Footer, LanguageSwitcher, ThemeToggle), `components/ui/`. Saem `components/animations/{Particles,CountUp,FadeInView,StaggerChildren}.tsx`, `SectionDivider` e o filtro de projetos.
- **Conteúdo:** `messages/pt.json` reorganizado, com `en.json` e `es.json` gerados de novo. Dados estruturais novos em `lib/content/`.
- **Dependências:** sai `framer-motion`. Não entra nenhuma biblioteca nova. As fontes vêm do `next/font`, já incluso no Next.
- **Arquivos:** `public/images/` ganha a imagem do CurrículoRaiz e as duas imagens da cena (claro e escuro), otimizadas.
- **Testes:** as capturas de referência mudam de propósito e são regeradas. Entra teste com JavaScript desligado e com movimento reduzido. `color-contrast` e `label-content-name-mismatch` saem da lista de violações conhecidas do axe.
