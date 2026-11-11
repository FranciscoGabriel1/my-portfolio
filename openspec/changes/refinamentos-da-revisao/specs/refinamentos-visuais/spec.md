## Purpose

Ajustes visuais pedidos na revisão do dono de 2026-11-11: mais espaço para a cena, seções que se distinguem à primeira vista, a marca e o nome sem defeitos, e a cena 3D mais fiel aos aparelhos reais.

## ADDED Requirements

### Requirement: Conteúdo mais largo nas telas grandes
O contêiner do site SHALL chegar a 96rem de largura, com margens laterais de 1,25rem no celular e de 4rem a partir de 56,25rem de largura. No computador, a coluna da cena 3D do Hero MUST NOT ficar sobre o texto, os botões ou o nome.

#### Scenario: Hero numa tela de 1440 px
- **WHEN** o visitante abre o site numa janela de 1440 × 900
- **THEN** nenhum aparelho da cena (nem a imagem de reserva) cobre o nome, o texto de apresentação ou os botões do Hero

### Requirement: Seções em faixas distintas
Cada seção SHALL ficar numa faixa de fundo de largura total. As faixas alternam entre a superfície da página e uma superfície vizinha, e a seção de contato tem uma faixa de destaque. Cada faixa SHALL ter uma trama de pontos sutil que se desloca devagar, sem interferir na leitura. Os tokens de texto MUST manter o contraste AA sobre todas as faixas, nos dois temas. Com movimento reduzido, ou sem JavaScript, a trama fica parada.

#### Scenario: Rolar a página
- **WHEN** o visitante rola do Hero até o Contato
- **THEN** a mudança de fundo marca onde cada seção começa e termina

#### Scenario: Contraste nas faixas
- **WHEN** o teste de acessibilidade roda nos dois temas, em 1440 e 390 px de largura
- **THEN** não há violação de contraste em nenhuma faixa

#### Scenario: Movimento reduzido
- **WHEN** o visitante pede movimento reduzido
- **THEN** as faixas aparecem com a trama parada

### Requirement: Logomarca é o nome
A logomarca da barra de navegação SHALL ser só o nome "Francisco Marinho" em texto, sem selo de iniciais, e continuar sendo o link para o início da página.

#### Scenario: Barra de navegação
- **WHEN** o visitante olha a barra de navegação
- **THEN** vê o nome como marca, sem o selo "FM", e o link leva ao Hero

### Requirement: Nome do Hero inteiro e animado
Nenhuma letra do nome grande do Hero SHALL ser cortada pela máscara da animação. As letras do nome SHALL entrar uma a uma no carregamento. Com o ponteiro sobre o nome, uma onda percorre as letras a partir da letra sob o ponteiro: elas sobem de leve e ganham a cor de acento, sem mudar de largura, para a linha não se rearranjar. O nome MUST continuar sendo lido como a frase inteira por leitores de tela. Com movimento reduzido, o nome aparece pronto e a onda não acontece. Sem JavaScript, o nome aparece pronto.

#### Scenario: Letras redondas nas bordas
- **WHEN** o nome termina em "o" ou em outra letra redonda
- **THEN** a curva da letra aparece inteira, sem corte

#### Scenario: Onda sob o ponteiro
- **WHEN** o visitante passa o ponteiro sobre o nome no computador
- **THEN** as letras perto do ponteiro sobem e ficam na cor de acento, e voltam ao normal quando ele sai

#### Scenario: Leitor de tela
- **WHEN** um leitor de tela chega ao título do Hero
- **THEN** ele lê o nome como uma frase, não letra por letra

### Requirement: Transição de tema suave
O círculo da troca de tema SHALL crescer em cerca de 1 segundo, com aceleração e desaceleração graduais. Uma nova troca durante a animação MUST pular a anterior, como já acontece. Com movimento reduzido, a troca continua instantânea.

#### Scenario: Troca de tema
- **WHEN** o visitante troca o tema com movimento normal
- **THEN** o círculo nasce no botão e cobre a tela em cerca de 1 segundo, sem trancos

### Requirement: Aparelhos da cena como os reais
O notebook da cena SHALL lembrar um MacBook Pro atual: acabamento preto-espacial, tampa fina com borda estreita e recorte da câmera, grades de alto-falante dos dois lados do teclado, fileira de teclas de função e trackpad grande. A tela SHALL iluminar o teclado e a base, e a luz acompanha o brilho do que aparece nela. A sombra de um aparelho MUST NOT cair sobre a face de outro. Os pôsteres de reserva SHALL ser gerados de novo a partir da cena atualizada.

#### Scenario: Celular e tablet sem sombra por cima
- **WHEN** a cena está parada no estado de repouso, nos dois temas
- **THEN** a tela do celular e a do tablet não têm sombra do notebook nem de outro aparelho sobre elas

#### Scenario: Luz da tela
- **WHEN** a cena roda no tema escuro
- **THEN** o teclado e a base do notebook mostram o reflexo da luz da tela, mais forte perto da dobradiça
