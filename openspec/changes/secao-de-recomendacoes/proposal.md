## Why

As recomendações que colegas publicaram no LinkedIn são a prova social mais forte que o dono tem: nove textos, de 2021 a 2026, de pessoas que trabalharam com ele na HostGator, na Atem, na Sidia e na faculdade. Em 2026-11-12 ele pediu uma seção com elas, antes do Contato.

## What Changes

- **Nova seção "Recomendações"** entre a Trajetória e o Contato, que passa a ser a 06.
- **Textos idênticos ao LinkedIn**, sem tradução nem correção: são citações. Cada um leva `lang` com o idioma original (pt-BR ou en), e as versões em inglês e espanhol do site avisam que os textos estão no idioma original.
- **Autoria:** nome, cargo resumido (o início do título no LinkedIn), a relação ("mesma equipe" ou "equipes diferentes") e o mês da recomendação, formatado no idioma da página. Iniciais no lugar das fotos, que são imagens de terceiros.
- **Link "Ver no LinkedIn"** para a página de recomendações do perfil, onde tudo pode ser conferido.
- **Destaque** para a recomendação mais recente (Nathan Heinzmann, 2026), recolhida no começo do texto.
- **Efeitos do carrossel:** cartões da mesma altura (autoria no pé), aspas decorativas, brilho que segue o ponteiro, cartão que sobe no hover, contador "01 / 08" com barra de progresso, bordas esmaecidas só do lado com mais cartões e, onde o navegador suporta animações ligadas à rolagem, cartões que crescem ao entrar e diminuem ao sair. Tudo parado com movimento reduzido.
- **Carrossel na própria página** para as demais (não um modal, para a prova social continuar visível): rolagem horizontal nativa com encaixe por cartão, setas anterior/próxima numa ilha mínima de cliente (só com JavaScript) e teclado na faixa focável. Textos longos aparecem cortados com esmaecimento e um "Ler completa" (`<details>` nativo); o corte é só visual, o leitor de tela recebe o texto inteiro.

## Capabilities

### New Capabilities
- `recomendacoes`: o que a seção mostra, a fidelidade aos textos originais e o comportamento em cada idioma.

### Modified Capabilities

(nenhuma)

## Impact

- **Código:** `lib/content/recommendations.ts` (textos e autoria), `components/sections/Recommendations.tsx` (de servidor), `components/motion/CarouselControls.tsx` (setas), `app/[locale]/page.tsx`, numeração do Contato.
- **Conteúdo:** `messages/{pt,en,es}.json` (`recommendations`).
- **Peso:** só a ilha das setas, menos de 1 kB; o resto é HTML e CSS.
