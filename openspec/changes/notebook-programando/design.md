## Decisions

1. **Vídeo gravado de uma página HTML, como o anterior.** O roteiro é uma página (`design/prototipos/notebook-codigo/index.html`) em 1024 × 640, gravada pelo Playwright (`scripts/scene-screens/record-code.js`) e codificada em VP9 (`-crf 46`) pelo ffmpeg do Playwright. Um canvas desenhado em tempo real na cena daria texto mais nítido, mas custaria CPU a cada quadro e código novo no pedaço 3D. O vídeo mantém o custo e o comportamento que já existiam.
2. **Mesmo quadro no começo e no fim.** A página marca `document.title = "start"` quando a passada começa e `"done"` quando termina; o script corta exatamente esse trecho. O primeiro quadro vira a imagem parada, então a troca imagem → cena não muda o conteúdo da tela.
3. **Cinco projetos**, escolhidos por visual variado. O print do portal da Atem mostrava nomes e CNPJ de terceiros: as áreas foram borradas no próprio arquivo, que também serve à seção Projetos.
