## Why

Na revisão de 2026-11-11, com o site rodando no navegador, o dono apontou nove ajustes. A cena 3D quase encosta no texto. A troca de tema parece brusca. A logomarca repete o nome com um "FM". O "o" do nome grande aparece cortado. As seções se confundem umas com as outras. O MacBook está longe do modelo real da Apple. Há uma sombra caindo por cima do celular e do tablet. O formulário de contato depende de três bibliotecas que o dono não quer manter. Nenhum desses pontos muda o conteúdo, mas todos afetam a primeira impressão de quem avalia o site.

## What Changes

- **Largura do conteúdo:** o contêiner do site fica mais largo nas telas grandes. A coluna da cena 3D ganha espaço, e o texto do Hero deixa de ficar sob os aparelhos.
- **Transição de tema mais suave:** o círculo cresce mais devagar, com aceleração e desaceleração gradual. Com movimento reduzido, a troca continua instantânea.
- **Logomarca:** sai o selo "FM". O próprio nome, em texto, é a marca.
- **Nome grande sem corte:** as letras do nome não perdem a borda por causa da máscara da animação de entrada.
- **Animação do nome:** as letras do nome grande entram uma a uma. Com o ponteiro em cima, uma onda de peso percorre as letras. Nada disso acontece com movimento reduzido, e o texto continua inteiro para leitores de tela.
- **Seções bem separadas:** cada seção fica numa faixa de fundo própria, alternando superfícies, com uma trama de pontos que se move devagar. A trama fica parada com movimento reduzido, e o contraste AA é mantido.
- **MacBook Pro no estilo da Apple:** acabamento preto-espacial, tampa fina, recorte da câmera, grades de alto-falante, fileira de teclas de função, trackpad grande. A luz da tela se reflete no teclado e na base.
- **Sombra sobre os aparelhos:** celular e tablet ficam acima do chão da cena, e a sombra do notebook deixa de cobri-los. Os pôsteres são gerados de novo.
- **Formulário sem bibliotecas:** saem `react-hook-form`, `zod` e `@hookform/resolvers`. A validação passa a usar só a plataforma e um módulo próprio, que o servidor também vai usar. O assunto vira uma lista de escolha acessível com ícones, no mesmo padrão do formulário do CurrículoRaiz: Oportunidade de trabalho, Proposta de projeto, Parceria ou colaboração, Feedback sobre o portfólio, Problema no site e Outro. "Outro" abre um campo livre. O comportamento visível continua o mesmo: erros traduzidos junto ao campo, envio só com teclado, avisos anunciados.

## Fora do escopo

- Segurança do formulário no servidor (limite, escape, campo isca): continua no bloco 5 de `fundacao-stack-e-qualidade`. Esta change só troca a validação compartilhada de Zod por um módulo próprio, que aquele bloco vai reutilizar.
- Mudanças de texto, de estrutura das seções ou de conteúdo.

## Capabilities

### New Capabilities
- `assunto-do-contato`: como o visitante escolhe o assunto da mensagem, inclusive o texto livre de "Outro", por teclado, por leitor de tela e sem JavaScript.
- `refinamentos-visuais`: largura do conteúdo, separação das seções em faixas, logomarca, nome do Hero sem corte e com animação, aparelhos da cena sem sombra indevida e transição de tema mais suave.

### Modified Capabilities

(nenhuma: as specs das changes anteriores ainda não foram arquivadas em `openspec/specs/`. A regra "validação no servidor com as mesmas regras do cliente", de `formulario-de-contato`, continua valendo e passa a ser cumprida por um módulo próprio em vez de Zod.)

## Impact

- **Dependências:** saem `react-hook-form`, `zod` e `@hookform/resolvers`. Nenhuma entra.
- **Código:** `app/globals.css` (contêiner, faixas, máscara do nome), `components/layout/Navbar.tsx`, `components/layout/ThemeToggle.tsx`, `components/sections/Hero.tsx`, `components/motion/SplitText.tsx`, `components/scene/hero-scene.ts`, `components/sections/ContactForm.tsx`, um novo `components/ui/SubjectSelect.tsx`, um novo `lib/contact/validate.ts` (sai `lib/contact-validation.ts`), as seções que recebem as faixas e `messages/*.json`.
- **Arquivos:** os pôsteres `public/images/scene/blocks-{dark,light}.webp` gerados de novo.
- **Testes:** testes unitários da validação, da lista de assunto e da hidratação, e capturas visuais de referência novas.
- **Documentação:** `docs/otimizacao-de-desempenho.md` registra o peso que sai com as bibliotecas do formulário.
