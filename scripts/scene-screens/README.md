# Telas da cena 3D do Hero

Scripts que geram o conteúdo das telas dos aparelhos em `public/images/scene/screens/`. Eles rodam o CurrículoRaiz
**localmente** e simulam a API no navegador de teste: nada é lido da API real, do banco ou da conta de alguém.

| Arquivo gerado | Script | De onde vem |
|---|---|---|
| `curriculoraiz-tablet.webp` | `capture-landing.js` | página pública curriculoraiz.com (820 px) |
| `curriculoraiz-admin-phone.webp` | `admin-demo.js` | painel admin real, com **dados de demonstração** (390 px) |
| `curriculoraiz-editor.webm` e `-still.webp` | `record.js` + `mock.js` | editor real em uso, com o exemplo público da Ada Lovelace (1280 px) |

Regras que não mudam: nenhum dado real de usuário ou do negócio entra nas imagens, e os números do painel são
fictícios.

## Como regenerar

```bash
export CURRICULORAIZ_DIR="$HOME/Documentos/Gabriel Projetos/meuresumo"   # pasta com curriculoraiz-web e -api
export SCENE_TMP="$(mktemp -d)"                                          # saídas intermediárias

# 1. Dados do exemplo e catálogo de modelos, a partir do código da API (sem subir o servidor)
(cd "$CURRICULORAIZ_DIR/curriculoraiz-api" && npx tsx "$OLDPWD/scripts/scene-screens/dump-example.ts" "$SCENE_TMP/ada.json" \
  && npx tsx "$OLDPWD/scripts/scene-screens/dump-templates.ts" "$SCENE_TMP/templates.json")

# 2. O app web em desenvolvimento, numa porta separada
(cd "$CURRICULORAIZ_DIR/curriculoraiz-web" && npx vite --port 5180 --strictPort --host 127.0.0.1) &

# 3. Capturas (rodar da raiz deste projeto)
node scripts/scene-screens/capture-landing.js
node scripts/scene-screens/admin-demo.js
node scripts/scene-screens/record.js
```

Depois, converter as saídas de `$SCENE_TMP` para WebP/WebM (o ffmpeg do Playwright fica em
`~/.cache/ms-playwright/ffmpeg-*/ffmpeg-linux` e codifica VP9): o vídeo em 1024×640, `-crf 46`, cortado no trecho
indicado em `video/cut.json`; a imagem parada do notebook é o **primeiro quadro** do vídeo, para a troca imagem → cena
não mudar o conteúdo da tela. Por fim, regenerar os pôsteres com `scripts/render-scene-posters.ts`.
