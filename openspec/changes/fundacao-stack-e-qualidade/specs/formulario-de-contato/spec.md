## Purpose

Garantir que o formulário de contato do portfólio entregue ao dono só mensagens válidas e seguras, resista a abuso automatizado e informe o visitante com clareza, no idioma da página, sobre o resultado do envio.

## ADDED Requirements

### Requirement: Validação no servidor com as mesmas regras do cliente
O servidor SHALL validar cada envio com as mesmas regras exibidas no formulário antes de qualquer entrega: nome com 2 a 100 caracteres, e-mail em formato válido com até 254 caracteres, assunto com 1 a 150 caracteres e mensagem com 10 a 5.000 caracteres, todos sem espaços nas pontas. Um envio que viole qualquer regra MUST ser rejeitado com status 400, indicar quais campos falharam e não gerar e-mail.

#### Scenario: Envio válido é entregue
- **WHEN** o visitante envia nome, e-mail, assunto e mensagem dentro das regras
- **THEN** o servidor responde com status 200 e o dono recebe exatamente um e-mail com esses dados

#### Scenario: Envio inválido feito direto na API é recusado
- **WHEN** alguém envia à API um e-mail sem `@` e uma mensagem de 3 caracteres, sem passar pelo formulário
- **THEN** o servidor responde com status 400, lista os campos `email` e `message` como inválidos e nenhum e-mail é enviado

### Requirement: Requisições malformadas são recusadas
O servidor SHALL recusar, sem tentar entregar, requisições cujo corpo não seja JSON válido (status 400), cujo tipo de conteúdo não seja `application/json` (status 415) ou cujo corpo passe de 16 KB (status 413).

#### Scenario: Corpo que não é JSON
- **WHEN** a API recebe o texto `nome=teste` com tipo `application/json`
- **THEN** o servidor responde com status 400 e nenhum e-mail é enviado

#### Scenario: Corpo grande demais
- **WHEN** a API recebe um JSON de 20 KB
- **THEN** o servidor responde com status 413 e nenhum e-mail é enviado

### Requirement: Limite de envios por origem
O servidor SHALL aceitar no máximo 5 envios por origem a cada 10 minutos. O envio que passar do limite MUST receber status 429 com o cabeçalho `Retry-After` em segundos e não gerar e-mail.

#### Scenario: Sexto envio em menos de 10 minutos
- **WHEN** a mesma origem faz 6 envios válidos em 2 minutos
- **THEN** os 5 primeiros são entregues e o sexto recebe status 429 com `Retry-After`

#### Scenario: Limite liberado depois da janela
- **WHEN** a mesma origem envia de novo 10 minutos depois do primeiro envio
- **THEN** o envio é aceito normalmente

### Requirement: Campo isca contra robôs
O formulário SHALL incluir um campo isca invisível para pessoas e ignorado por leitores de tela e pela navegação por teclado. Quando esse campo chegar preenchido, o servidor MUST responder como se o envio tivesse dado certo e MUST NOT gerar e-mail.

#### Scenario: Robô preenche o campo isca
- **WHEN** um envio chega com todos os campos válidos e o campo isca preenchido
- **THEN** o servidor responde com status 200 e nenhum e-mail é enviado

#### Scenario: Pessoa usando teclado não encontra o campo isca
- **WHEN** o visitante percorre o formulário com a tecla Tab
- **THEN** o foco passa por nome, e-mail, assunto, mensagem e botão de envio, e nunca pelo campo isca

### Requirement: Conteúdo do visitante nunca vira código no e-mail
O e-mail entregue ao dono SHALL exibir o texto digitado pelo visitante exatamente como texto: caracteres especiais de HTML MUST ser escapados, o e-mail MUST ter também uma versão em texto puro e o assunto MUST ter quebras de linha removidas.

#### Scenario: Código no nome
- **WHEN** o visitante envia o nome `<script>alert(1)</script>`
- **THEN** o dono recebe um e-mail que mostra esse texto literalmente, sem executar nem interpretar a marcação

#### Scenario: Tentativa de injetar cabeçalho pelo assunto
- **WHEN** o assunto enviado contém uma quebra de linha seguida de `Bcc: alguem@exemplo.com`
- **THEN** o e-mail sai com o assunto em uma única linha e sem destinatário adicional

### Requirement: Falhas não expõem detalhes internos
Quando a entrega falhar ou o serviço não estiver configurado, o servidor SHALL responder com um código de erro genérico (status 502 para falha do provedor de e-mail, 503 para configuração ausente), registrar o detalhe só no log do servidor e MUST NOT incluir mensagens do provedor, chaves ou endereços internos na resposta.

#### Scenario: Provedor de e-mail fora do ar
- **WHEN** o provedor de e-mail devolve um erro durante o envio
- **THEN** o visitante recebe status 502 com um código genérico, e a mensagem do provedor aparece apenas no log do servidor

#### Scenario: Destinatário não configurado
- **WHEN** a variável de ambiente do destinatário não está definida
- **THEN** o servidor responde com status 503 e não tenta enviar

### Requirement: Resultado informado ao visitante no idioma da página
O formulário SHALL informar sucesso, erro de validação, excesso de envios e falha de entrega com textos vindos de `messages/` em pt, en e es, anunciados a tecnologias assistivas, e MUST permitir todo o fluxo só com teclado.

#### Scenario: Envio só com teclado
- **WHEN** o visitante preenche os campos e aciona o botão de envio usando apenas o teclado
- **THEN** a mensagem é enviada e o aviso de sucesso é anunciado pelo leitor de tela

#### Scenario: Excesso de envios em inglês
- **WHEN** um visitante na página `/en` recebe status 429
- **THEN** o formulário mostra, em inglês, que houve envios demais e que é possível tentar de novo mais tarde

#### Scenario: Erros de campo traduzidos
- **WHEN** um visitante na página `/es` tenta enviar com o e-mail inválido
- **THEN** o erro aparece em espanhol junto ao campo de e-mail e o envio não acontece
