"use client";

import { useEffect } from "react";

/**
 * Brilho que segue o ponteiro dentro de cada cartão (`selector`) do contêiner: grava a posição em `--mx` e `--my`, e
 * o CSS desenha o brilho. Só com ponteiro fino; não renderiza nada.
 */
export function CardGlow({
  targetId,
  selector = ".tech-card",
}: {
  targetId: string;
  selector?: string;
}) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element).closest<HTMLElement>(selector);
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => root.removeEventListener("pointermove", onMove);
  }, [targetId, selector]);

  return null;
}
