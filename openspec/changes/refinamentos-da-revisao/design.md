## Context

Revisão do dono em 2026-11-11 sobre a página com a cena 3D. Os nove pontos são independentes e pequenos, e todos usam a infraestrutura que já existe: tokens de `globals.css`, `SplitText` e `MotionReady` para o movimento, `hero-scene.ts` para a cena e o script de pôsteres.

## Goals / Non-Goals

**Goals:** resolver os nove pontos sem biblioteca nova, sem piorar o LCP e mantendo AA, teclado e as alternativas (movimento reduzido, sem JS, sem WebGL).

**Non-Goals:** segurança do formulário no servidor (bloco 5 da fundação), mudanças de texto ou de estrutura.

## Decisions

1. **Contêiner de 96rem.** `container-site` passa de `min(82rem, …)` para `min(96rem, …)`. No Hero, as colunas mudam de 11fr/9fr para 1fr/1fr, e a câmera da cena ganha um enquadramento com mais folga à esquerda. Assim os aparelhos ficam dentro da própria coluna, mesmo com o canvas maior que ela (o canvas tem 1,5× de sobra para os aparelhos não serem cortados).
2. **Transição de tema:** 1000 ms com `cubic-bezier(0.65, 0, 0.35, 1)`, uma curva que acelera e desacelera devagar. O comportamento não muda.
3. **Máscara do nome.** O corte vem do `overflow: hidden` da máscara de cada palavra somado ao espaçamento negativo entre letras de `type-giant`. A máscara ganha `padding-inline: 0.08em` e `margin-inline: -0.08em`. Ela fica maior que a palavra só por dentro, e o espaçamento visível não muda.
4. **Animação do nome sem biblioteca.** `SplitText` ganha o modo `letters`: cada palavra se divide em letras (`aria-hidden`, com a frase em `sr-only`, como hoje). A entrada é por CSS, com atraso por letra. A onda usa um ouvinte de ponteiro numa ilha mínima de cliente (`NameWave`). Ele calcula a distância de cada letra ao ponteiro (curva gaussiana) e escreve uma variável CSS `--wave` por letra. O CSS sobe a letra com `translate` e mistura a cor com `--accent-text`, com transição. Uma onda de peso foi descartada: o nome já usa o peso máximo (800), e mudar o peso muda a largura, o que faria a linha se rearranjar. O efeito só existe com ponteiro fino, hover e sem movimento reduzido.
5. **Faixas das seções.** Três classes: `band` (`--bg`), `band-alt` (`--surface`) e `band-invert`. A última, no Contato e no rodapé, redefine os tokens com a paleta do outro tema, então o AA já testado vale também ali. Um teste confere que as cópias são idênticas às paletas originais. A trama de pontos é um `radial-gradient` num pseudo-elemento, com máscara para ficar num canto da faixa. O pseudo-elemento é um passo de trama maior que a faixa, e a faixa o recorta (`overflow: clip`). A animação é um `transform` de um passo da trama a cada 24 s, sem repintura. Ela só roda com `data-motion="ready"` e sem movimento reduzido. Custo zero em JS.
6. **MacBook no estilo da Apple.** Modelado com as primitivas que a cena já usa, sem modelo externo:
   - **Corpo:** alumínio preto-espacial, com `MeshPhysicalMaterial` em cor `#2e2f33`, rugosidade 0,42 e um verniz leve. A base fica mais fina, com cantos de raio maior, e o recorte para abrir a tampa vira um chanfro na frente.
   - **Tampa:** 0,07 de espessura, borda preta de 0,08 e recorte da câmera no topo, uma `RoundedBox` preta.
   - **Teclado:** teclas pretas com fileira de função de meia altura e Touch ID no canto. Dos dois lados, grades de alto-falante feitas de `InstancedMesh` de furos escuros.
   - **Trackpad:** grande, quase da largura do teclado.
   - **Luz da tela:** a `RectAreaLight` foi descartada, porque as tabelas de `RectAreaLightTexturesLib` pesam 110 kB gzip, quase o tamanho da cena inteira. No lugar, um `SpotLight` preso à tampa, saindo da tela sobre o teclado, e um plano com brilho aditivo pintado na base, mais forte perto da dobradiça. Cor e força acompanham a cor média da tela, lida a cada 500 ms num canvas de 4 × 4 px, e somem quando a tampa fecha.
7. **Sombra sobre os aparelhos.** As sombras de contato são planos com degradê em y≈0, e as faces do celular e do tablet, inclinadas, desciam abaixo de y=0. Por isso a sombra do notebook era desenhada por cima. Correção: subir celular e tablet até a borda inferior ficar acima do chão (fundo em y≥0,05) e posicionar a sombra de contato de cada um sob a própria borda. Depois, reenquadrar a câmera e gerar os pôsteres de novo.
8. **Lista de assunto própria (`SubjectSelect`).** Botão `role="combobox"` com `aria-expanded`, `aria-controls` e `aria-activedescendant`, e lista `role="listbox"` com `role="option"`/`aria-selected`. Teclado conforme o padrão da APG. Um `<input type="hidden" name="subject">` leva o valor quando o formulário é enviado. A lista abre sobre o conteúdo (`position: absolute`), sem empurrar o resto. Clicar fora fecha a lista, por `pointerdown` no documento enquanto ela está aberta.
   - **Opções:** escolhidas para um portfólio. A lista do CurrículoRaiz (Crítica, Sugestão, Elogio…) fala de um produto. O padrão da opção livre "Outro" é o mesmo.
9. **Validação própria (`lib/contact/validate.ts`).** Função pura `validateContact(input) → { data, errors }`, com códigos de erro (`name_short`, `email_invalid`…) e sem texto. O componente traduz os códigos com `messages/`. A expressão do e-mail é a mesma do HTML (`type=email`). O tamanho máximo também fica no `maxLength` dos campos. O servidor do bloco 5 importa o mesmo módulo.

## Risks / Trade-offs

- **Onda de peso com muitas letras:** são cerca de 17 letras, e o cálculo roda por `requestAnimationFrame` só enquanto o ponteiro se move sobre o nome. Custo desprezível.
- **`RectAreaLight` sem sombra:** ilumina através de objetos. Só a base do notebook fica no alcance dela, então não aparece luz atravessando os outros aparelhos.
- **Faixas com trama:** num tema claro a trama pode virar ruído. A opacidade é de 0,35 no claro e 0,5 no escuro, com cor `--line`, e as capturas de referência conferem o resultado.
- **Lista própria em vez de `<select>` nativo:** um `<select>` nativo não mostra ícones nas opções. Sem JavaScript o formulário já não envia (aviso existente), então perder a lista nativa não tira nada de quem está sem JS.
