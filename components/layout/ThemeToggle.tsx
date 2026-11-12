"use client";

import { useRef } from "react";
import { flushSync } from "react-dom";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { setTheme, useTheme, type Theme } from "@/lib/theme";

/**
 * Botão de tema com transição circular (View Transitions API): o tema novo cresce a partir do centro do botão.
 * Sem a API ou com movimento reduzido, a troca é instantânea, como antes.
 */
export function ThemeToggle() {
  // O tema só é conhecido no navegador: `undefined` no servidor e na hidratação.
  const theme = useTheme();
  const t = useTranslations("theme");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const transitionRef = useRef<ViewTransition | null>(null);

  if (!theme) {
    return <div className="h-10 w-10" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const button = buttonRef.current;

    if (typeof document.startViewTransition !== "function" || reduce || !button) {
      setTheme(next);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const root = document.documentElement;

    // Trocas seguidas: termina a transição em andamento e vale sempre o último tema pedido.
    transitionRef.current?.skipTransition();
    const transition = document.startViewTransition(() => {
      // Sem transições de cor durante a captura, para a tela nova não sair no meio de um `transition-colors`.
      root.classList.add("theme-capturing");
      // Aplica no <html> e redesenha o botão dentro da captura, para o ícone novo já sair na tela nova.
      flushSync(() => setTheme(next));
    });
    transitionRef.current = transition;

    transition.ready
      .then(() => {
        root.animate(
          // Começa do tamanho do botão (sem "estalo" no primeiro quadro) e acelera e desacelera devagar.
          {
            clipPath: [
              `circle(${rect.width / 2}px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 1000,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {});
    transition.finished.finally(() => {
      root.classList.remove("theme-capturing");
      if (transitionRef.current === transition) transitionRef.current = null;
    });
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      aria-label={isDark ? t("toggle_light") : t("toggle_dark")}
      onClick={toggle}
    >
      {isDark ? (
        <Moon className="h-[18px] w-[18px]" aria-hidden />
      ) : (
        <Sun className="h-[18px] w-[18px]" aria-hidden />
      )}
    </Button>
  );
}
