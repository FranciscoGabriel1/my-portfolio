## Purpose

Definir a aparência do portfólio (paleta quente, temas claro e escuro, tipografia e foco) de modo que todo texto e todo controle sejam legíveis com contraste WCAG 2.2 AA, em qualquer tema e idioma.

## ADDED Requirements

### Requirement: Paleta quente nos temas escuro e claro
O site SHALL oferecer dois temas com a paleta aprovada. O escuro MUST usar fundo `#141311`, superfícies `#1D1C19` e `#272521`, texto `#F2EEE6`, texto secundário `#BDB6A8`, texto terciário `#958E81` e acento `#FF6B2C`. O claro MUST usar fundo `#F4F1EA`, superfícies `#EAE5DA` e `#DFD9CC`, texto `#171612`, texto secundário `#4A463E`, texto terciário `#655F55` e acento `#FF6B2C`. O fundo escuro MUST ser chapado, sem luz ambiente, granulação ou grade. O tema escuro MUST continuar sendo o padrão, e o visitante MUST poder trocar de tema e ter a escolha lembrada.

#### Scenario: Primeira visita
- **WHEN** alguém abre `/pt` pela primeira vez, sem tema salvo e com o sistema em modo escuro
- **THEN** a página aparece com fundo `#141311` e texto `#F2EEE6`, sem piscar outro tema antes

#### Scenario: Troca de tema só com teclado
- **WHEN** o visitante chega ao botão de tema com Tab e aperta Enter
- **THEN** a página passa para o tema claro, o botão anuncia no idioma da página o tema para o qual vai trocar e, ao recarregar, o tema claro continua

### Requirement: Contraste de texto AA em todos os temas
Todo texto visível SHALL ter contraste de pelo menos 4,5:1 com o fundo sobre o qual aparece, e texto grande (a partir de 24 px, ou 18,66 px em negrito) pelo menos 3:1, nos dois temas. Isso inclui rótulos, legendas, texto de botão, placeholder e texto sobre o acento. O texto em cor de acento MUST usar o tom de texto do acento (`#FF8A55` no escuro, `#A8360A` no claro), e não o acento de preenchimento.

#### Scenario: Varredura automática
- **WHEN** o axe roda em `/pt`, `/en` e `/es`, nos temas claro e escuro, em 1440 px e 390 px
- **THEN** não há nenhuma violação de `color-contrast`, e a regra sai da lista de violações conhecidas

#### Scenario: Texto terciário sobre superfície
- **WHEN** um rótulo em texto terciário aparece sobre a superfície mais clara de cada tema
- **THEN** o contraste medido é de pelo menos 4,5:1

### Requirement: Bordas de campos e indicador de foco visíveis
A borda de campos de formulário e o indicador de foco SHALL ter contraste de pelo menos 3:1 com as cores vizinhas, nos dois temas. Todo elemento focável MUST mostrar o foco quando recebe foco pelo teclado, sem ficar escondido sob o cabeçalho fixo.

#### Scenario: Foco no tema claro
- **WHEN** o visitante percorre a página com Tab no tema claro
- **THEN** cada link, botão e campo mostra um contorno de foco com contraste de pelo menos 3:1 sobre o fundo creme

#### Scenario: Foco não fica sob o cabeçalho
- **WHEN** o foco vai para um link de uma seção logo abaixo do cabeçalho
- **THEN** o elemento focado aparece inteiro na tela, sem ser coberto pelo cabeçalho

### Requirement: Tipografia do projeto sem salto de layout
Os títulos SHALL usar Bricolage Grotesque, o texto corrido Instrument Sans e os rótulos JetBrains Mono, servidos pelo próprio site, sem requisição a servidores de fontes de terceiros no navegador do visitante. A troca da fonte reserva pela definitiva MUST NOT causar salto de layout perceptível.

#### Scenario: Carregamento das fontes
- **WHEN** a página carrega numa conexão lenta de celular
- **THEN** o texto aparece logo com a fonte reserva, a troca para a fonte definitiva não move o conteúdo de modo perceptível e o CLS da página fica abaixo de 0,1

#### Scenario: Nenhuma requisição externa de fonte
- **WHEN** se inspeciona a rede ao abrir `/en`
- **THEN** nenhuma fonte é pedida a `fonts.googleapis.com` ou `fonts.gstatic.com`
