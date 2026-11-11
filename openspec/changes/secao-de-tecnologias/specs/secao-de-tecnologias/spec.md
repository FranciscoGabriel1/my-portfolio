## Purpose

Mostrar as tecnologias que o dono domina de forma organizada, enxuta e verificável. Cada item é real, e o que foi usado no CurrículoRaiz fica marcado.

## ADDED Requirements

### Requirement: Tecnologias em seis grupos, com logotipo
A seção de competências SHALL mostrar seis grupos: Frontend, Estado e ferramentas, Backend e infra, Produto e integrações, Qualidade e IA no desenvolvimento. Cada tecnologia SHALL aparecer com logotipo e nome, e o logotipo é decorativo. Os nomes e os rótulos vêm de `messages/` em pt, en e es. A seção MUST listar só tecnologias que aparecem nos repositórios deste portfólio ou do CurrículoRaiz, ou que já estavam nas competências do dono.

#### Scenario: Leitor de tela
- **WHEN** um leitor de tela percorre a seção
- **THEN** ele lê cada grupo como uma lista com título e cada tecnologia pelo nome, sem anunciar os logotipos

#### Scenario: Idioma
- **WHEN** o visitante abre `/en`
- **THEN** os títulos dos grupos e os nomes traduzíveis ("Redux and Redux Saga", "Sign in with Google") aparecem em inglês

### Requirement: Marca do CurrículoRaiz
As tecnologias usadas no CurrículoRaiz SHALL ter um ponto na cor de acento, explicado por uma legenda visível. Para leitor de tela, o ponto MUST ter um texto equivalente ("usado no CurrículoRaiz").

#### Scenario: Prisma
- **WHEN** o visitante vê o cartão Backend e infra
- **THEN** Prisma tem o ponto de acento e AWS não tem

### Requirement: Movimento discreto nos cartões
Os cartões SHALL subir em cascata ao entrar na tela, e as tecnologias aparecem uma a uma dentro de cada cartão. Com o ponteiro sobre um cartão, um brilho de acento SHALL seguir o ponteiro. Sobre uma tecnologia, o logotipo ganha a cor da marca, ou a cor do texto quando a cor da marca some no fundo do tema. Com movimento reduzido ou sem JavaScript, tudo aparece pronto.

#### Scenario: Sem JavaScript
- **WHEN** o visitante abre a página com o JavaScript desligado
- **THEN** todos os cartões e tecnologias estão visíveis
