## ADDED Requirements

### Requirement: Tela do notebook mostra a construção dos projetos
A tela do notebook SHALL mostrar um vídeo de um editor de código genérico, sem logotipos de terceiros, montando a vitrine de projetos. A cada projeto adicionado no código, o preview SHALL mostrar o site daquele projeto com print, contexto e stack reais, de `lib/content/projects.ts`. Os prints MUST NOT mostrar dados de terceiros. O vídeo SHALL começar e terminar no mesmo quadro, e esse quadro SHALL ser a imagem parada usada no celular e na imagem de reserva.

#### Scenario: Computador
- **WHEN** a cena roda num computador
- **THEN** o notebook mostra o código sendo digitado e o preview passando por CurrículoRaiz, HostGator, Atem, Teksto e UpRobotics, em loop sem salto visível

#### Scenario: Celular ou imagem de reserva
- **WHEN** a cena roda num aparelho de toque, ou aparece a imagem de reserva
- **THEN** o notebook mostra o quadro parado com o arquivo completo e o CurrículoRaiz no preview

### Requirement: Tablet e celular mostram a troca de tema do CurrículoRaiz
As telas do tablet e do celular SHALL alternar entre o tema claro e o escuro do CurrículoRaiz, com esmaecimento, em ciclos defasados entre si. As duas versões MUST ter o mesmo tamanho de imagem e rolar alinhadas. Na imagem de reserva, as telas ficam no tema claro.

#### Scenario: Cena rodando
- **WHEN** a cena roda por alguns segundos
- **THEN** o celular e o tablet passam ao tema escuro e voltam ao claro, cada um num momento diferente, sem salto no conteúdo
