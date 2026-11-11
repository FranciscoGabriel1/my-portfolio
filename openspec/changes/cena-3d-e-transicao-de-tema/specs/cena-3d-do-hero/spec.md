## Purpose

Definir quando a cena 3D dos blocos aparece no Hero, como ela substitui a imagem estática sem atrapalhar o conteúdo, como reage ao visitante e quais limites de custo ela não pode ultrapassar, mantendo a imagem como versão final para quem não pode ou não deve rodar 3D.

## ADDED Requirements

### Requirement: A cena só roda quando pode rodar bem
A cena 3D SHALL rodar apenas quando o navegador tem WebGL, o sistema não pede movimento reduzido, o visitante não pediu economia de dados e o aparelho não é fraco (pouca memória ou poucos núcleos de processador). Em qualquer outro caso, o Hero MUST mostrar a imagem estática da cena, na versão do tema atual, sem baixar o código 3D.

#### Scenario: Sem WebGL
- **WHEN** alguém abre `/pt` num navegador sem WebGL
- **THEN** o Hero mostra a imagem da cena, nenhum código 3D é baixado e não há erro no console

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido
- **THEN** o Hero mostra a imagem da cena e nenhum código 3D é baixado

#### Scenario: Movimento reduzido ligado com a cena rodando
- **WHEN** a cena está rodando e o visitante liga o movimento reduzido no sistema
- **THEN** a cena para, é removida e a imagem volta, sem recarregar a página

#### Scenario: Economia de dados ou aparelho fraco
- **WHEN** o navegador informa economia de dados, ou o aparelho tem menos de 4 GB de memória ou menos de 4 núcleos
- **THEN** o Hero mostra a imagem da cena e nenhum código 3D é baixado

### Requirement: A cena não atrasa o conteúdo
O código 3D SHALL ficar fora do carregamento inicial e só ser pedido depois do LCP, com o navegador ocioso. Medido pelo Lighthouse no perfil de celular com limitação real, o LCP MUST continuar em até 2,0 s nos três idiomas (1,9 s antes desta change), o CLS em 0 e o bloqueio total abaixo de 200 ms. O JavaScript inicial da página MUST continuar com no máximo 230 kB gzip (224 kB antes desta change).

#### Scenario: Medição em celular
- **WHEN** o Lighthouse roda em `/pt`, `/en` e `/es` no perfil de celular com limitação real
- **THEN** o LCP fica em até 2,0 s, o CLS em 0 e o bloqueio total abaixo de 200 ms

#### Scenario: Código 3D fora do início
- **WHEN** se inspeciona a rede até o evento de carregamento da página
- **THEN** nenhum arquivo do Three.js foi pedido, e o JavaScript inicial tem no máximo 230 kB gzip

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** o carregamento é igual ao de antes desta change, porque o código 3D nem é pedido

### Requirement: A troca da imagem pela cena é imperceptível
Enquanto a cena carrega, o Hero SHALL mostrar a imagem estática. Quando a cena fica pronta, ela MUST ocupar exatamente o mesmo lugar e enquadramento da imagem e aparecer por cima dela sem salto de layout. Se a cena falhar a qualquer momento (erro ao carregar ou perda do contexto WebGL), a imagem MUST voltar, sem mensagem de erro para o visitante.

#### Scenario: Cena pronta
- **WHEN** a cena 3D termina de carregar
- **THEN** ela aparece por cima da imagem, na mesma posição e enquadramento, e o CLS da página continua 0

#### Scenario: Perda do contexto WebGL
- **WHEN** o navegador perde o contexto WebGL com a cena rodando
- **THEN** a imagem estática volta a aparecer no lugar da cena

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido
- **THEN** a imagem estática é a versão final, e nenhuma troca acontece

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** a imagem estática é a versão final, e nenhuma troca acontece

### Requirement: Movimento da cena
Ao aparecer, os blocos SHALL se assentar no lugar em até 1,5 s. Depois, com ponteiro preciso (mouse ou trackpad), a cena MUST inclinar de leve na direção do ponteiro. Enquanto o visitante rola para fora do Hero, os blocos MUST se afastar uns dos outros na proporção da rolagem e voltar ao rolar de volta, sem interceptar nem suavizar a rolagem.

#### Scenario: Rolagem para fora do Hero
- **WHEN** o visitante rola da posição inicial até o Hero sair da tela
- **THEN** os blocos se afastam progressivamente, e ao rolar de volta ao topo voltam à composição montada. A rolagem segue nativa durante todo o trajeto

#### Scenario: Só com teclado
- **WHEN** o visitante navega pelo Hero apenas com Tab e Enter
- **THEN** nenhum conteúdo depende do ponteiro, a cena não recebe foco e os links do Hero funcionam normalmente

#### Scenario: Toque, sem ponteiro preciso
- **WHEN** o visitante usa um celular com tela de toque
- **THEN** a cena não reage ao ponteiro, mas os blocos se assentam ao aparecer e se afastam com a rolagem

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido
- **THEN** não há assentamento, inclinação nem afastamento, porque o Hero mostra a imagem estática

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL
- **THEN** não há movimento da cena, porque o Hero mostra a imagem estática

### Requirement: A cena não gasta recursos fora de vista
A cena SHALL parar de desenhar quadros quando o Hero sai da tela ou a aba fica oculta, e voltar quando o Hero reaparece ou a aba volta a ficar visível.

#### Scenario: Hero fora da tela
- **WHEN** o visitante rola até a seção Projetos
- **THEN** a cena não desenha nenhum quadro enquanto o Hero estiver fora da tela

#### Scenario: Aba oculta
- **WHEN** o visitante troca para outra aba
- **THEN** a cena para de desenhar até a aba voltar a ficar visível

### Requirement: A cena acompanha o tema e é decorativa
A cena SHALL usar as cores do tema atual e trocar de cores quando o tema muda, inclusive durante a transição circular. Ela MUST ser ignorada por leitores de tela e não receber foco.

#### Scenario: Troca de tema com a cena rodando
- **WHEN** o visitante troca do tema escuro para o claro com a cena rodando
- **THEN** o fundo e os blocos da cena passam às cores do tema claro, sem recarregar a cena

#### Scenario: Leitor de tela
- **WHEN** um leitor de tela percorre o Hero
- **THEN** a cena não é anunciada, e o Tab não passa por ela
