"use client";

import { useLayoutEffect } from "react";
import { syncThemeFromStorage } from "@/lib/theme";
import { THEME_SCRIPT } from "@/lib/theme-script";

/**
 * Aplica o tema salvo antes da primeira pintura (lib/theme-script.ts).
 *
 * No HTML do servidor, é um script comum: o navegador o executa enquanto lê o <head>, e a página nunca pisca no tema
 * errado. No navegador, vira `text/plain`: quando o layout é redesenhado sem recarregar a página (troca de idioma),
 * o React recriaria o <script>, que não seria executado e gera aviso no React 19.
 *
 * Nesse redesenho o React também refaz o <html> e a classe do tema some; o efeito de layout a reaplica antes da
 * pintura (na primeira carga, só confirma o que o script já fez).
 *
 * Exceção consciente à regra "nada de `window` na renderização": a diferença entre servidor e navegador está só no
 * atributo `type`, e `suppressHydrationWarning` cobre exatamente esse atributo.
 */
export function ThemeScript() {
  useLayoutEffect(() => syncThemeFromStorage(), []);

  return (
    <script
      type={typeof window === "undefined" ? undefined : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
