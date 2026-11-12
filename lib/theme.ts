import { useSyncExternalStore } from "react";

/**
 * Tema claro/escuro sem biblioteca (substitui o next-themes, cujo script dentro de um componente de cliente gerava
 * aviso no React 19). A classe `light`/`dark` fica no <html> e a escolha em `localStorage.theme`.
 *
 * - O script que aplica o tema antes da primeira pintura está em lib/theme-script.ts (importado pelo layout).
 * - `useTheme` lê o tema do <html> e acompanha mudanças, inclusive de outra aba. No servidor e na hidratação devolve
 *   `undefined`, porque o tema só existe no navegador.
 */

import { DEFAULT_THEME, THEME_KEY, type Theme } from "./theme-script";

export type { Theme };
export { DEFAULT_THEME, THEME_KEY };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

/** Aplica no <html> na hora, guarda a escolha e avisa quem usa `useTheme` (de forma síncrona, para `flushSync`). */
export function setTheme(theme: Theme) {
  applyTheme(theme);
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Armazenamento bloqueado: o tema vale até a próxima visita.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Outra aba trocou o tema: acompanha.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    applyTheme(e.newValue === "light" ? "light" : "dark");
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const readTheme = (): Theme =>
  document.documentElement.classList.contains("light") ? "light" : "dark";

export function useTheme(): Theme | undefined {
  return useSyncExternalStore(subscribe, readTheme, () => undefined);
}
