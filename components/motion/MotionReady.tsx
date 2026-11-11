"use client";

import { useEffect } from "react";

const REVEAL = "[data-reveal]";

/**
 * Liga as entradas ao rolar (ver "Movimento" em app/globals.css).
 *
 * O HTML do servidor já é o estado final. Este componente:
 * 1. marca como revelado o que está na tela ou acima dela (nada visível some para depois animar);
 * 2. só então marca <html data-motion="ready">, o que deixa o CSS esconder o que está abaixo;
 * 3. revela cada bloco ao entrar na tela, uma única vez, e revela na hora (sem transição) o bloco que recebe foco.
 *
 * Com movimento reduzido, o CSS não esconde nada, então os passos acima não têm efeito visível.
 * Se este código não rodar, `data-motion` nunca é marcado e todo o conteúdo continua visível.
 */
export function MotionReady() {
  useEffect(() => {
    const root = document.documentElement;
    const reveal = (el: Element) => el.setAttribute("data-revealed", "");

    const pending: Element[] = [];
    for (const el of document.querySelectorAll(REVEAL)) {
      if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
      else pending.push(el);
    }
    root.setAttribute("data-motion", "ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    pending.forEach((el) => observer.observe(el));

    // Foco pelo teclado: o bloco aparece na hora, sem esmaecer (`data-reveal-instant` desliga a transição).
    const onFocusIn = (event: FocusEvent) => {
      const block = (event.target as Element | null)?.closest?.(REVEAL);
      if (!block || block.hasAttribute("data-revealed")) return;
      block.setAttribute("data-reveal-instant", "");
      reveal(block);
    };
    document.addEventListener("focusin", onFocusIn);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocusIn);
      root.removeAttribute("data-motion");
    };
  }, []);

  return null;
}
