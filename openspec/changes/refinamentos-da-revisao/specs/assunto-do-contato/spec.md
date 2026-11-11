## Purpose

Deixar o visitante escolher o assunto da mensagem numa lista curta e clara, sem obrigá-lo a inventar um título, e ainda permitir um assunto livre. O formulário não depende de bibliotecas de formulário ou de validação.

## ADDED Requirements

### Requirement: Assunto escolhido numa lista com opção livre
O campo de assunto SHALL ser uma lista de escolha única com ícone e texto em cada opção: Oportunidade de trabalho, Proposta de projeto, Parceria ou colaboração, Feedback sobre o portfólio, Problema no site e Outro. Os textos vêm de `messages/` em pt, en e es. Ao escolher "Outro", um campo de texto "Qual assunto?" SHALL aparecer logo abaixo e receber o foco. Esse campo MUST ser obrigatório, com 1 a 150 caracteres. O assunto enviado ao servidor é o texto da opção escolhida, no idioma da página, ou o texto digitado em "Outro".

#### Scenario: Escolher uma opção da lista
- **WHEN** o visitante abre a lista e escolhe "Proposta de projeto"
- **THEN** a lista fecha, o botão mostra o ícone e o texto da opção, e o envio leva o assunto "Proposta de projeto"

#### Scenario: Escolher "Outro"
- **WHEN** o visitante escolhe "Outro"
- **THEN** o campo "Qual assunto?" aparece, recebe o foco, e o envio leva o texto digitado nele

#### Scenario: "Outro" sem texto
- **WHEN** o visitante escolhe "Outro", deixa o campo livre vazio e tenta enviar
- **THEN** o erro aparece junto ao campo livre, no idioma da página, e o envio não acontece

#### Scenario: Sem assunto
- **WHEN** o visitante tenta enviar sem escolher assunto
- **THEN** o erro "Escolha um assunto" aparece junto à lista e o foco vai para ela

### Requirement: Lista de assunto acessível
A lista SHALL seguir o padrão de caixa de seleção com lista (`combobox` que controla um `listbox`), com rótulo associado, estado aberto ou fechado anunciado e opção ativa indicada. Pelo teclado, Enter, Espaço e seta para baixo MUST abrir a lista. As setas e as teclas Home e End movem a opção ativa, e digitar uma letra vai para a opção que começa com ela. Enter ou Espaço escolhem a opção, Esc fecha sem mudar a escolha, e Tab fecha e segue. Clicar fora fecha a lista. O foco MUST continuar visível em todos os estados, e a lista aberta MUST NOT empurrar o resto do formulário.

#### Scenario: Escolher só com teclado
- **WHEN** o visitante chega à lista com Tab, aperta seta para baixo duas vezes e Enter
- **THEN** a segunda opção abaixo da atual fica escolhida, a lista fecha e o foco volta ao botão da lista

#### Scenario: Esc mantém a escolha anterior
- **WHEN** o visitante abre a lista com "Feedback sobre o portfólio" escolhido, move a opção ativa e aperta Esc
- **THEN** a lista fecha e "Feedback sobre o portfólio" continua escolhido

#### Scenario: Leitor de tela
- **WHEN** um leitor de tela chega à lista
- **THEN** ele anuncia o rótulo "Assunto", o valor escolhido (ou que nada foi escolhido) e que é uma lista recolhida

### Requirement: Formulário sem bibliotecas de formulário
O formulário de contato SHALL validar com um módulo próprio, sem `react-hook-form`, `zod` ou `@hookform/resolvers`. As regras são as da spec `formulario-de-contato`: nome com 2 a 100 caracteres, e-mail válido com até 254, assunto com 1 a 150 e mensagem com 10 a 5.000, todos sem espaços nas pontas. O mesmo módulo MUST poder rodar no servidor. A validação SHALL acontecer no envio. Depois de um envio recusado, cada campo é validado de novo enquanto o visitante corrige. O foco vai para o primeiro campo com erro.

#### Scenario: Erros traduzidos sem biblioteca
- **WHEN** um visitante em `/es` envia com o e-mail `ana@` e a mensagem "oi"
- **THEN** os erros aparecem em espanhol junto ao e-mail e à mensagem, o foco vai para o e-mail e nada é enviado

#### Scenario: Erro some ao corrigir
- **WHEN** depois de um envio recusado o visitante corrige o e-mail
- **THEN** o erro do e-mail some enquanto ele digita, sem novo envio

#### Scenario: Nenhuma biblioteca de formulário no pacote
- **WHEN** o site é construído para produção
- **THEN** `react-hook-form`, `zod` e `@hookform/resolvers` não estão nas dependências nem em nenhum pedaço de JavaScript enviado ao navegador
