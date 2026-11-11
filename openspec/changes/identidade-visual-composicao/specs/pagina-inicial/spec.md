## Purpose

Definir o que a página única do portfólio mostra, em que ordem e como se navega por ela, para que recrutadores e líderes técnicos entendam em poucos segundos quem é o dono, o que ele construiu e como falar com ele, só com informação real, nos três idiomas.

## ADDED Requirements

### Requirement: Seções na ordem aprovada
A página de cada idioma SHALL apresentar, nesta ordem, as seções Hero, Sobre, Projetos, Trajetória e Contato, cada uma com um título de nível 2 (o Hero com o nome como título de nível 1), entre um cabeçalho e um rodapé. O primeiro elemento focável MUST ser um link "Pular para o conteúdo" traduzido.

#### Scenario: Estrutura lida por leitor de tela
- **WHEN** um leitor de tela lista os títulos de `/en`
- **THEN** aparece um único título de nível 1 com o nome do dono e, depois dele, os títulos de nível 2 das seções Sobre, Projetos, Trajetória e Contato, em inglês

#### Scenario: Pular para o conteúdo só com teclado
- **WHEN** o visitante abre `/es` e aperta Tab uma vez e depois Enter
- **THEN** aparece o link "Saltar al contenido principal" e o foco vai para o conteúdo principal

### Requirement: Cabeçalho com navegação, idioma, tema e CV
O cabeçalho SHALL conter a marca com o nome do dono (link para o topo), links para Sobre, Projetos, Trajetória e Contato, a troca de idioma com as opções PT, EN e ES, o botão de tema e o link "Baixar CV" do idioma da página. O idioma atual MUST ser indicado de forma visível e para leitores de tela. Em telas estreitas, os links das seções MUST ficar num menu que abre e fecha por um botão.

#### Scenario: Troca de idioma só com teclado
- **WHEN** o visitante em `/pt` chega com Tab à opção EN e aperta Enter
- **THEN** a página `/en` abre, e a opção EN é anunciada como o idioma atual

#### Scenario: Menu de celular só com teclado
- **WHEN** numa tela de 390 px o visitante foca o botão de menu e aperta Enter, depois Esc
- **THEN** o menu abre com o foco no primeiro link e o botão anunciado como expandido. Ao apertar Esc, o menu fecha e o foco volta ao botão

#### Scenario: Link de seção leva à seção
- **WHEN** o visitante ativa "Projetos" no cabeçalho
- **THEN** a página rola até a seção Projetos, o título dela fica visível abaixo do cabeçalho e o próximo Tab parte dessa seção

### Requirement: Hero apresenta o dono sem números sem fonte
O Hero SHALL mostrar a situação profissional (aberto a oportunidades e local), o nome do dono, uma frase de posicionamento, os links "Ver projetos" e "Baixar CV", a lista "Onde já construí" com as empresas e instituições da trajetória e uma imagem decorativa dos blocos coerente com o tema. O Hero MUST NOT mostrar contadores ou números sem fonte confirmada pelo dono, nem texto que troca sozinho.

#### Scenario: Conteúdo do Hero
- **WHEN** alguém abre `/pt` em 1440 px
- **THEN** vê o nome "Francisco Marinho", a frase de posicionamento, os dois links, a lista com HostGator, O2 Filmes, Atem, Sidia e iComp UFAM e a imagem dos blocos, e não vê "30+ projetos" nem cargo alternando

#### Scenario: Imagem decorativa ignorada pelo leitor de tela
- **WHEN** um leitor de tela percorre o Hero
- **THEN** a imagem dos blocos não é anunciada

#### Scenario: Links do Hero só com teclado
- **WHEN** o visitante foca "Ver projetos" com Tab e aperta Enter
- **THEN** a página vai para a seção Projetos

### Requirement: Sobre com texto, fatos e competências
A seção Sobre SHALL mostrar o texto de apresentação, quatro fatos curtos (local, formação, cargo atual e produto próprio) e as competências agrupadas em Frontend, Estado e ferramentas, Backend e infra e Qualidade.

#### Scenario: Fatos e competências
- **WHEN** alguém lê a seção Sobre em `/en`
- **THEN** encontra os quatro fatos e os quatro grupos de competências, todos em inglês

### Requirement: Projetos com um caso em destaque e os demais em lista
A seção Projetos SHALL mostrar um projeto em destaque, com imagem, papel, descrição, stack e link, e os demais projetos em lista numerada com nome, contexto, stack e link quando houver. O CurrículoRaiz MUST estar entre os projetos, identificado como produto próprio do dono. Todo link externo MUST abrir em nova aba e avisar isso a leitores de tela, com nome acessível que começa pelo texto visível.

#### Scenario: CurrículoRaiz presente
- **WHEN** alguém lê a seção Projetos em qualquer idioma
- **THEN** encontra o CurrículoRaiz com link para `https://curriculoraiz.com/` e a indicação de que é produto próprio

#### Scenario: Link externo só com teclado
- **WHEN** o visitante foca o link de um projeto com Tab e aperta Enter
- **THEN** o site do projeto abre numa nova aba, e o leitor de tela tinha anunciado o texto visível do link seguido de "abre em nova aba" no idioma da página

#### Scenario: Projeto sem link
- **WHEN** um projeto não tem endereço público
- **THEN** ele aparece sem link, e não com um link vazio ou para `#`

### Requirement: Trajetória com régua e experiência detalhada
A seção Trajetória SHALL mostrar uma régua de anos de 2019 até o ano atual, com uma barra por vínculo cujo início e fim correspondem às datas reais e o vínculo atual destacado, seguida da lista de experiências (período, cargo, empresa, local, regime e descrição) e da formação. A régua MUST ser decorativa para leitores de tela, porque a lista traz a mesma informação. Em telas com menos de 900 px de largura, a régua MUST ser omitida, e a lista continua.

#### Scenario: Barras nas datas reais
- **WHEN** a régua é exibida em 1440 px
- **THEN** a barra da Atem começa em maio de 2022 e termina em maio de 2025, e a da HostGator começa em outubro de 2025, vai até o mês atual e aparece destacada

#### Scenario: Leitura da trajetória por leitor de tela
- **WHEN** um leitor de tela percorre a seção Trajetória
- **THEN** a régua não é anunciada, e as experiências são lidas como uma lista ordenada da mais recente para a mais antiga

### Requirement: Contato com canais, agendamento e formulário recolhido
A seção Contato SHALL mostrar os canais e-mail, LinkedIn, GitHub, Lattes e Discord como links, o link "Baixar CV" e o formulário de mensagem recolhido sob "Prefere escrever por aqui?". Quando houver link de agendamento configurado, a seção e o cabeçalho MUST mostrar "Agendar call", abrindo a página de agendamento em nova aba. Sem link configurado, "Agendar call" MUST NOT aparecer em nenhum lugar. O formulário MUST manter o comportamento definido em `formulario-de-contato`.

#### Scenario: Sem link de agendamento
- **WHEN** o site é publicado sem link de agendamento configurado
- **THEN** não há "Agendar call" no cabeçalho nem no Contato, e nenhum link aponta para `#`

#### Scenario: Com link de agendamento
- **WHEN** o link de agendamento está configurado e o visitante ativa "Agendar call"
- **THEN** a página de agendamento abre numa nova aba

#### Scenario: Formulário recolhido só com teclado
- **WHEN** o visitante foca "Prefere escrever por aqui?" e aperta Enter
- **THEN** o formulário aparece, o controle é anunciado como expandido, e o próximo Tab vai para o campo Nome

#### Scenario: Erro de envio mantém o formulário aberto
- **WHEN** o envio falha por validação
- **THEN** o formulário continua aberto, com os erros anunciados ao lado de cada campo

### Requirement: Só informação real e traduzida
Todo texto visível, incluindo `alt`, `aria-label` e textos só para leitor de tela, SHALL vir das mensagens do idioma da página, nos três idiomas. A página publicada MUST NOT conter texto de exemplo, marcador "validar", campo "a preencher" ou número, cliente ou depoimento que o dono não tenha fornecido. Um dado ainda não confirmado pelo dono MUST ficar fora da página até ser confirmado.

#### Scenario: Página em espanhol
- **WHEN** alguém abre `/es`
- **THEN** todo texto visível e todo texto para leitor de tela está em espanhol, inclusive o aviso de nova aba e o rótulo do menu

#### Scenario: Nada de marcador de rascunho
- **WHEN** se procura no HTML gerado pelo build por "validar", "preencher" ou "Lorem"
- **THEN** nenhuma ocorrência é encontrada
