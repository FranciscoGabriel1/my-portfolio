/**
 * Tema claro/escuro: constantes e o script que aplica o tema antes da primeira pintura. Sem hooks, para poder ser
 * importado pelo layout (componente de servidor). O hook do botão fica em lib/theme.ts.
 *
 * `THEME_SCRIPT` vai num <script> no <head> do layout: lê `localStorage.theme` e põe a classe `light`/`dark` no
 * <html> antes de a página aparecer, sem piscar o tema errado.
 */

export type Theme = "light" | "dark";
export const THEME_KEY = "theme";
export const DEFAULT_THEME: Theme = "dark";

export const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem("${THEME_KEY}")}catch(e){}if(t!=="light"&&t!=="dark")t="${DEFAULT_THEME}";var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(t);r.style.colorScheme=t})()`;
