## Purpose

Definir como o portfólio troca entre os temas claro e escuro: com uma transição circular que nasce no botão de tema quando o navegador e as preferências do visitante permitem, e instantânea em todos os outros casos, sem nunca atrasar a troca nem perder a escolha.

## ADDED Requirements

### Requirement: Transição circular a partir do botão de tema
Ao trocar o tema, o tema novo SHALL se espalhar num círculo que nasce no centro do botão de tema e cobre a tela inteira em no máximo 700 ms. O tema escolhido MUST ser aplicado e lembrado do mesmo jeito que hoje, e o botão MUST anunciar, no idioma da página, o tema para o qual vai trocar em seguida.

#### Scenario: Troca com o mouse
- **WHEN** o visitante, no tema escuro, clica no botão de tema
- **THEN** o tema claro cresce em círculo a partir do botão até cobrir a página, e, ao recarregar, a página abre no tema claro

#### Scenario: Troca só com teclado
- **WHEN** o visitante chega ao botão de tema com Tab e aperta Enter
- **THEN** o círculo nasce no centro do botão, o foco continua no botão ao fim da transição e o leitor de tela anuncia o novo rótulo do botão

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido e o visitante troca o tema
- **THEN** o tema muda de uma vez, sem círculo nem esmaecimento

#### Scenario: Navegador sem a API de transição
- **WHEN** o navegador não oferece transições de visualização e o visitante troca o tema
- **THEN** o tema muda de uma vez, sem erro no console

#### Scenario: Sem WebGL
- **WHEN** o navegador não tem WebGL e o visitante troca o tema
- **THEN** a transição circular acontece do mesmo jeito, porque não depende de WebGL

### Requirement: Trocas seguidas não deixam a página presa
Trocas de tema feitas em sequência rápida SHALL terminar no último tema escolhido, sem a página ficar travada num estado intermediário e sem bloquear a rolagem ou os cliques depois da última transição.

#### Scenario: Dois cliques rápidos
- **WHEN** o visitante clica duas vezes no botão de tema em menos de 300 ms
- **THEN** a página termina no tema de partida, o botão mostra o rótulo correspondente e a página continua respondendo a rolagem e cliques

#### Scenario: Duas trocas pelo teclado
- **WHEN** o visitante aperta Enter duas vezes seguidas no botão de tema
- **THEN** a página termina no tema de partida, com o foco no botão
