## Purpose

Definir os cabeçalhos HTTP de segurança que toda resposta do portfólio envia, para reduzir riscos de clickjacking, detecção errada de tipo de conteúdo, vazamento de referência e acesso indevido a recursos do navegador.

## ADDED Requirements

### Requirement: Cabeçalhos de segurança em todas as respostas
Toda resposta do site, incluindo páginas em pt, en e es, arquivos estáticos e a API de contato, SHALL incluir:
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Frame-Options: DENY`;
- `Permissions-Policy` desligando câmera, microfone e geolocalização;
- `Strict-Transport-Security` com validade de pelo menos um ano.

#### Scenario: Página em português
- **WHEN** o navegador pede `/pt`
- **THEN** a resposta traz os cinco cabeçalhos com esses valores

#### Scenario: API de contato
- **WHEN** a API de contato responde a um envio, com sucesso ou com erro
- **THEN** a resposta traz os mesmos cinco cabeçalhos

### Requirement: O site não se anuncia
As respostas SHALL omitir o cabeçalho `X-Powered-By`.

#### Scenario: Cabeçalho do framework ausente
- **WHEN** o navegador pede `/en`
- **THEN** a resposta não contém `X-Powered-By`

### Requirement: O site não pode ser embutido em outro site
O site MUST recusar ser exibido dentro de um `iframe` de outra origem.

#### Scenario: Página embutida por terceiro
- **WHEN** uma página de outro domínio tenta carregar `/pt` num `iframe`
- **THEN** o navegador bloqueia a exibição
