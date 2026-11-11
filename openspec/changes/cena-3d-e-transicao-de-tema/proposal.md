## Why

A identidade "Composição" está no ar, mas a cena dos blocos no Hero ainda é uma imagem parada, e a troca de tema é um corte seco. O dono escolheu dois efeitos, a partir de prints de outro site feito com a mesma skill: a **transição circular do tema** e a **cena 3D no Hero**. Os dois tornam visível a ideia central do portfólio (interfaces como peças que se encaixam) e mostram domínio técnico a quem avalia, desde que não custem nada ao conteúdo, ao desempenho e à acessibilidade. A base para isso já existe: o HTML do servidor é o estado final, a imagem da cena já é a alternativa, e o critério de desempenho está medido (LCP de 1,9 s com limitação real).

## What Changes

- **Transição circular do tema:** ao trocar entre claro e escuro, o tema novo se espalha num círculo que nasce no botão de tema, também quando a troca é feita pelo teclado. Usa a View Transitions API do navegador, sem biblioteca. Com movimento reduzido, ou num navegador sem a API, a troca continua instantânea, como hoje.
- **Cena 3D no Hero:** os blocos da cena passam a ser um modelo 3D em tempo real (Three.js), na mesma composição da imagem atual.
  - Ao ficar pronta, a cena substitui a imagem sem salto visível e mostra os blocos se assentando no lugar.
  - Depois, os blocos respondem de leve ao ponteiro e se afastam aos poucos enquanto o visitante rola para fora do Hero. A rolagem continua nativa.
  - A cena carrega por import dinâmico, só depois do LCP e com o navegador ocioso. Ela pausa fora da tela e com a aba oculta, e acompanha o tema.
- **A imagem continua sendo a versão final** para movimento reduzido, falta de WebGL, economia de dados, aparelho fraco e qualquer falha da cena. As imagens claras e escuras passam a ser geradas a partir da própria cena 3D, para a troca ser imperceptível.

O que o visitante percebe: ao abrir o site, o Hero aparece igual a hoje. Um instante depois, os blocos ganham volume e se encaixam, reagem ao mouse e se desmontam devagar quando ele rola para baixo. Ao trocar o tema, a página nova cresce em círculo a partir do botão. Quem pede movimento reduzido, usa um celular fraco ou está sem WebGL vê o site de hoje, completo e parado.

## Fora do escopo

- **Mundo 3D com capítulos** guiado pela rolagem (câmera por atos, trilho "01/04", etiquetas presas à cena): o dono escolheu não fazer agora.
- **Texto atravessando a linha d'água:** fora, por falta de metáfora própria para o portfólio.
- Camadas em CSS 3D no caso em destaque de Projetos: change própria (`projetos-como-casos`), se o dono quiser.
- Áudio, partículas, pós-processamento (bloom, profundidade de campo) e qualquer efeito de fundo no tema escuro: o dono pediu o preto chapado.
- Mudanças de texto, de estrutura ou de outras seções.

## Capabilities

### New Capabilities
- `transicao-de-tema`: como a troca entre claro e escuro acontece, inclusive por teclado, com movimento reduzido e em navegadores sem suporte.
- `cena-3d-do-hero`: quando a cena 3D aparece ou não, como ela substitui a imagem, como reage ao ponteiro, à rolagem e ao tema, e os limites de custo que ela não pode ultrapassar.

### Modified Capabilities

(nenhuma: as specs de `identidade-visual-composicao`, como `movimento-e-alternativas`, ainda não foram arquivadas em `openspec/specs/`. A imagem da cena continua cumprindo o requisito "Imagem dos blocos como versão sem 3D" daquela change, sem mudança de comportamento.)

## Impact

- **Dependências:** entra `three` (cerca de 120 a 150 kB gzip), carregado só depois do LCP e só quando a cena vai rodar. Nada novo no carregamento inicial.
- **Código:** `components/layout/ThemeToggle.tsx` (transição), `components/sections/Hero.tsx` (lugar da cena), novo `components/scene/` (carregador de cliente e módulo da cena), `app/globals.css` (regras da transição e da troca imagem → cena).
- **Arquivos:** `public/images/scene/blocks-{light,dark}.webp` regeneradas a partir da cena. O protótipo fica em `design/prototipos/`.
- **Testes:** testes de navegador para a cena (aparece com WebGL, não aparece sem WebGL, com movimento reduzido ou com economia de dados, e pausa fora da tela) e para a transição (instantânea com movimento reduzido). As capturas de referência continuam usando a imagem.
- **Documentação:** `docs/otimizacao-de-desempenho.md` ganha a seção da cena 3D, com o custo medido.
- **Ordem:** recomenda-se arquivar `identidade-visual-composicao` antes de aplicar esta change. Falta só a conferência do dono com o Orca (tarefa 6.8).
