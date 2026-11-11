## Purpose

Definir como o portfólio se move (texto revelado por palavra, entradas ao rolar e régua que cresce) e garantir que o conteúdo continue completo e legível sem JavaScript, com movimento reduzido, sem WebGL e em celular fraco, sem sequestrar a rolagem nem piorar o carregamento.

## ADDED Requirements

### Requirement: Rolagem nativa
A rolagem da página SHALL ser a nativa do navegador, sem suavização, inércia ou interceptação de roda, toque ou teclado. Links internos MAY rolar suavemente até o destino, exceto com movimento reduzido, quando o salto MUST ser imediato. Nenhum trecho da página MUST prender a rolagem nem exigir rolar mais do que a altura do conteúdo para avançar.

#### Scenario: Teclas de rolagem
- **WHEN** o visitante usa Page Down, espaço e as setas
- **THEN** a página rola com a velocidade e o passo nativos do navegador

#### Scenario: Link interno com movimento reduzido
- **WHEN** o sistema pede movimento reduzido e o visitante ativa "Contato" no cabeçalho
- **THEN** a página salta direto para a seção, sem animação de rolagem

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** a rolagem e os links internos se comportam igual, porque nada neles depende de WebGL

### Requirement: Entradas ao rolar
Blocos marcados para entrada SHALL aparecer com um deslocamento curto para cima e um esmaecimento de até 0,9 s quando entram na tela, uma única vez por carregamento. Conteúdo já visível quando a página termina de carregar MUST NOT ser escondido para depois animar. Um elemento que recebe foco pelo teclado MUST ficar visível imediatamente, mesmo que a entrada dele ainda não tenha acontecido.

#### Scenario: Seção entra na tela
- **WHEN** o visitante rola até a seção Trajetória
- **THEN** os blocos da seção sobem e aparecem, e não repetem a animação ao rolar para cima e para baixo de novo

#### Scenario: Foco antes da entrada
- **WHEN** o visitante aperta Tab até um link de uma seção que ainda não entrou na tela
- **THEN** o link aparece visível e com foco, sem esperar a animação

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido
- **THEN** todos os blocos aparecem já na posição final, sem deslocamento nem esmaecimento

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** as entradas acontecem do mesmo jeito, porque não dependem de WebGL

### Requirement: Texto revelado por palavra
O nome no Hero SHALL entrar palavra por palavra logo ao carregar, e os títulos das seções ao entrarem na tela. O leitor de tela MUST anunciar cada título uma única vez, como frase inteira, e copiar o título MUST resultar no texto normal. A animação do nome MUST NOT atrasar o LCP além do orçamento.

#### Scenario: Leitor de tela
- **WHEN** um leitor de tela chega ao título "O que já construí"
- **THEN** anuncia a frase inteira uma vez, e não palavra por palavra

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido
- **THEN** o nome e os títulos aparecem inteiros e parados desde o primeiro quadro

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** o texto é revelado do mesmo jeito, porque não depende de WebGL

### Requirement: Régua que cresce
As barras da régua da Trajetória SHALL crescer da esquerda para a direita, uma após a outra, quando a régua entra na tela, uma única vez.

#### Scenario: Régua entra na tela
- **WHEN** a régua entra na tela em 1440 px
- **THEN** as barras crescem em sequência até as posições das datas reais

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido
- **THEN** as barras aparecem já no tamanho final

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** a régua cresce do mesmo jeito, porque é feita sem WebGL

### Requirement: Conteúdo completo sem JavaScript
Com JavaScript desligado, a página SHALL mostrar todo o texto, as imagens e os links de todas as seções, já na posição final, e os links internos e externos MUST funcionar. Nenhum conteúdo MUST depender de JavaScript para ficar visível.

#### Scenario: JavaScript desligado
- **WHEN** alguém abre `/pt` com JavaScript desligado e rola até o fim
- **THEN** lê o Hero, o Sobre, todos os projetos, a trajetória completa e os canais de contato, sem nenhum bloco invisível ou cortado

#### Scenario: Falha no JavaScript
- **WHEN** o JavaScript da página falha ao carregar depois do HTML
- **THEN** nenhum conteúdo fica escondido à espera de uma animação

### Requirement: Imagem dos blocos como versão sem 3D
O Hero SHALL mostrar a cena dos blocos como imagem estática, na versão do tema atual, sem depender de WebGL. A imagem MUST ser decorativa, MUST NOT causar salto de layout ao carregar e MUST NOT atrasar o texto do Hero.

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** o Hero aparece completo, com a imagem dos blocos

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido
- **THEN** o Hero mostra a mesma imagem, parada

#### Scenario: Troca de tema
- **WHEN** o visitante troca para o tema claro
- **THEN** a imagem passa para a versão clara, sem salto de layout

### Requirement: Orçamento de desempenho
Medida no perfil de celular do Lighthouse, a página de cada idioma SHALL ter LCP abaixo de 2,5 s, CLS abaixo de 0,1 e bloqueio total abaixo de 200 ms. O JavaScript carregado pela rota MUST ser menor que antes desta change. Efeitos de passar o mouse que movem elementos MUST ficar parados com movimento reduzido.

#### Scenario: Medição em celular
- **WHEN** o Lighthouse roda em `/pt`, `/en` e `/es` no perfil de celular
- **THEN** o LCP fica abaixo de 2,5 s, o CLS abaixo de 0,1 e o bloqueio total abaixo de 200 ms

#### Scenario: Peso do JavaScript
- **WHEN** se compara o build desta change com o anterior
- **THEN** o JavaScript da rota `/[locale]` é menor

#### Scenario: Movimento reduzido em botões
- **WHEN** o sistema pede movimento reduzido e o visitante passa o mouse sobre um botão
- **THEN** o botão muda de cor, mas não se desloca
