## Why

O notebook da cena 3D mostrava o editor do CurrículoRaiz em uso. Em 2026-11-12 o dono pediu que a tela mostrasse alguém programando, no estilo do VS Code, e que o resultado fossem os prints dos projetos que ele já publicou. Assim a cena conta como ele constrói, e não só o que um produto faz. O tablet e o celular continuam com o CurrículoRaiz. O roteiro foi aprovado no protótipo `design/prototipos/notebook-codigo/`.

## What Changes

- **Vídeo novo no notebook:** um editor genérico no estilo do VS Code, sem marcas, monta a vitrine de projetos em `Projects.tsx`. A cada `<Project id="..." />` digitado, o preview "navega" para o site do projeto, com endereço, print, contexto e stack reais: CurrículoRaiz, painel do cliente da HostGator, portal do cliente da Atem, Teksto e UpRobotics.
- **Loop sem emenda:** o vídeo começa e termina no mesmo quadro, com o arquivo completo e o CurrículoRaiz no preview. Esse quadro é a imagem parada da tela no celular e na imagem de reserva.
- **Troca de tema no tablet e no celular:** as duas telas do CurrículoRaiz alternam entre o tema claro e o escuro a cada 12 s, cada uma no seu tempo, para mostrar a troca de tema do produto. As versões escuras foram capturadas com os mesmos scripts (chave `amj-theme`), no mesmo tamanho das claras, então as duas rolam alinhadas.
- **Velocidade normal:** o vídeo antigo era acelerado em 1,3×; o novo já tem o ritmo certo.
- **Sai** o vídeo do editor do CurrículoRaiz (`curriculoraiz-editor.webm` e a imagem parada). Os scripts que o gravavam ficam, para regravar se ele voltar.
- **Print da Atem sem dados de terceiros:** o nome da usuária, o posto cliente, o CNPJ, o número do pedido e a razão social foram borrados em `public/images/projects/portal_atem.webp`. A seção Projetos, que publicava o print original em PNG, passa a usar o mesmo arquivo (90 kB, antes 176 kB).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `cena-3d-do-hero`: o conteúdo da tela do notebook. A spec ainda não foi arquivada em `openspec/specs/`, então o delta vem nesta change.

## Impact

- **Arquivos:** `public/images/scene/screens/notebook-code.webm` (275 kB, antes 483 kB) e `notebook-code-still.webp` (36 kB). Imagens de reserva geradas de novo (37 e 36 kB).
- **Código:** `components/scene/hero-scene.ts` (vídeo novo, camada escura nas telas do tablet e do celular), `scripts/scene-screens/record-code.js` (gravação), `capture-landing.js` e `admin-demo.js` (tema escuro) e o README dos scripts.
- **Arquivos novos:** `curriculoraiz-tablet-dark.webp` (90 kB) e `curriculoraiz-admin-phone-dark.webp` (34 kB), baixados só quando a cena roda.
- **Desempenho:** nada muda no carregamento inicial. O vídeo continua só em computador, carregado depois da primeira interação, e ficou 208 kB mais leve.
