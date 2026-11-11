## Context

O protótipo aprovado é `design/prototipos/secao-tecnologias/index.html`. A seção fica dentro do Sobre, que é uma faixa `band-alt`. O site já tem o padrão de revelação por `data-reveal`, com a classe `data-motion="ready"` que só existe com JavaScript.

## Decisions

1. **Logotipos numa folha de símbolos externa (`public/icons/tech.svg`), usada com `<use href>`.** Inline, os logotipos dos cartões somariam dezenas de kB ao HTML de cada idioma. Externa, a folha é baixada uma vez, fica em cache e herda `currentColor`. O Simple Icons (CC0) fornece os logotipos. Onde não há logotipo (Zustand, AWS, Design System, GrowthBook, Playwright, WCAG, OpenSpec, graphify), entra um ícone do lucide, que já é a biblioteca de ícones do site.
2. **Gerador sem dependência.** `scripts/tech-icons/build.mjs` lê os ids de ícone em `lib/content/skills.ts` e, de uma pasta do Simple Icons baixada à parte (`SIMPLE_ICONS_DIR`), escreve a folha e `lib/content/tech-icon-colors.ts`. Esse arquivo guarda a cor de hover de cada ícone por tema: a cor da marca, ou a do texto quando o contraste com o fundo fica abaixo de 2,2:1. Os dois arquivos gerados vão para o repositório.
3. **Conteúdo e código separados.** `messages/` guarda os rótulos e os nomes (`about.skills.<grupo>.items.<id>`). `lib/content/skills.ts` guarda a ordem, o ícone e a marca do CurrículoRaiz de cada id. Um teste confere que os dois têm os mesmos ids nos três idiomas.
4. **Movimento só com CSS e uma ilha pequena.**
   - `CardGlow` grava a posição do ponteiro em variáveis CSS do cartão.
   - A cascata reaproveita `data-reveal="children"`, com atraso por `--i` em cada tecnologia.
   - A faixa de logotipos do protótipo saiu na revisão: repetia os cartões e poluía a seção.
