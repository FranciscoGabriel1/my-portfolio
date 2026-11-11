## 1. Ajustes rápidos

- [x] 1.1 `container-site` com até 96rem; colunas do Hero 1fr/1fr
- [x] 1.2 Logomarca só com o nome (sai o selo "FM")
- [x] 1.3 Máscara do nome com folga lateral: o "o" aparece inteiro
- [x] 1.4 Transição de tema em 1000 ms com curva suave nas duas pontas

## 2. Animação do nome

- [x] 2.1 Modo `letters` no `SplitText` (frase em `sr-only`, letras `aria-hidden`) e entrada letra a letra por CSS
- [x] 2.2 Ilha `NameWave`: onda (sobe e ganha a cor de acento) a partir do ponteiro, só com hover e sem movimento reduzido
- [x] 2.3 Testes: frase inteira para o leitor de tela, sem onda com movimento reduzido

## 3. Faixas das seções

- [x] 3.1 Faixas `band`, `band-alt` e `band-invert` (Contato e rodapé com a paleta do outro tema), com teste de que as cópias da paleta batem com as originais
- [x] 3.2 Trama de pontos animada por CSS, parada com movimento reduzido e sem JS
- [x] 3.3 Aplicar as faixas em Hero, Sobre, Projetos, Trajetória e Contato

## 4. Cena 3D

- [x] 4.1 Celular e tablet acima do chão, sombras de contato sob cada aparelho
- [x] 4.2 MacBook Pro preto-espacial: tampa fina, recorte da câmera, alto-falantes, teclas de função, trackpad grande
- [x] 4.3 Luz da tela sobre a base (holofote e brilho aditivo; `RectAreaLight` descartada por 110 kB) acompanhando o brilho do vídeo
- [x] 4.4 Reenquadrar a câmera para a coluna nova e gerar os pôsteres de novo

## 5. Formulário sem bibliotecas

- [x] 5.1 `lib/contact/validate.ts` com as regras da spec e testes de cada uma
- [x] 5.2 `SubjectSelect` acessível com ícones e "Outro" com campo livre, e testes de teclado
- [x] 5.3 Reescrever `ContactForm` sem `react-hook-form`; mensagens novas em pt/en/es
- [x] 5.4 Remover `react-hook-form`, `zod`, `@hookform/resolvers` e `lib/contact-validation.ts`; ajustar o plano do bloco 5 da fundação

## 6. Verificação

- [x] 6.1 Lint, tipos, testes unitários e de navegador, build e capturas visuais novas
- [x] 6.2 Registrar o peso retirado em `docs/otimizacao-de-desempenho.md`
- [ ] 6.3 Conferência do dono no navegador (pt/en/es, claro/escuro, celular e computador, teclado, movimento reduzido)
