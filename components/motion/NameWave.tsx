"use client";

import { useEffect } from "react";

/** Raio da onda em fração do tamanho da fonte: cerca de duas letras para cada lado. */
const SPREAD = 0.9;

/**
 * Onda sobre o nome do Hero: as letras perto do ponteiro sobem e ganham a cor de acento, e voltam quando ele
 * sai (CSS em `.split-char`, globals.css). Só com ponteiro fino e sem movimento reduzido; sem JavaScript, o
 * nome fica parado. Não renderiza nada: liga-se ao título pelo id.
 */
export function NameWave({ targetId }: { targetId: string }) {
  useEffect(() => {
    const target = document.getElementById(targetId);
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    if (!target) return;

    let chars: HTMLElement[] = [];
    let centers: Array<{ x: number; y: number }> = [];
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    // Posições medidas na entrada do ponteiro (sem `translate`, que só muda o desenho), não a cada quadro.
    const measure = () => {
      chars = [...target.querySelectorAll<HTMLElement>(".split-char")];
      centers = chars.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const paint = () => {
      frame = 0;
      const size = parseFloat(getComputedStyle(target).fontSize) || 100;
      const sigma = size * SPREAD;
      chars.forEach((el, i) => {
        let wave = 0;
        if (pointer) {
          const dx = pointer.x - centers[i].x;
          const dy = (pointer.y - centers[i].y) * 1.6; // a onda corre na linha, não salta para a outra
          wave = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
        }
        el.style.setProperty("--wave", wave < 0.02 ? "0" : wave.toFixed(3));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onEnter = (e: PointerEvent) => {
      if (!media.matches) return;
      measure();
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      if (!media.matches || chars.length === 0) return;
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    target.addEventListener("pointerenter", onEnter);
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener("pointerenter", onEnter);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onLeave);
      chars.forEach((el) => el.style.removeProperty("--wave"));
    };
  }, [targetId]);

  return null;
}
