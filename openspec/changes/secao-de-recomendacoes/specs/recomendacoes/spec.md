## Purpose

Mostrar as recomendações públicas do LinkedIn do dono, fiéis ao original e verificáveis.

## ADDED Requirements

### Requirement: Recomendações fiéis ao LinkedIn
A seção SHALL mostrar as recomendações exatamente como publicadas no LinkedIn, sem tradução nem correção, com o nome de quem recomendou, o cargo resumido, a relação de trabalho e o mês da recomendação. Cada texto MUST ter o atributo `lang` do idioma original. A seção SHALL ter um link para a página de recomendações do perfil no LinkedIn.

#### Scenario: Leitor de tela
- **WHEN** um leitor de tela chega a uma recomendação em inglês numa página em português
- **THEN** ele lê o texto com a pronúncia do inglês, porque o bloco tem `lang="en"`

#### Scenario: Página em espanhol
- **WHEN** o visitante abre `/es`
- **THEN** os títulos, a relação e as datas estão em espanhol, e um aviso diz que as recomendações estão no idioma original

### Requirement: Sem imagens de terceiros
A seção MUST NOT usar fotos de quem recomendou. Cada autor é representado pelas iniciais.

#### Scenario: Autor
- **WHEN** o visitante vê uma recomendação
- **THEN** vê as iniciais num círculo, sem foto

### Requirement: Carrossel na página, sem modal
A recomendação mais recente SHALL aparecer em destaque e as demais numa faixa com rolagem horizontal nativa e encaixe por cartão. A faixa MUST ser alcançável e rolável pelo teclado. Setas "anterior" e "próxima" SHALL avançar um cartão por vez e ficar desativadas nas pontas; sem JavaScript, elas não aparecem e a faixa continua rolável. Textos longos SHALL aparecer cortados, com um "Ler completa" que abre o texto inteiro sem JavaScript; o corte MUST ser só visual.

#### Scenario: Setas
- **WHEN** o visitante aperta "Próxima recomendação"
- **THEN** a faixa avança um cartão e "Recomendação anterior" deixa de estar desativada

#### Scenario: Ler completa
- **WHEN** o visitante abre "Ler completa" num cartão
- **THEN** o texto inteiro aparece no próprio cartão e o botão passa a "Mostrar menos"
