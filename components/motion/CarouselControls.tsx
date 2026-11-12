"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Controles de uma faixa com rolagem horizontal nativa (`targetId`):
 * - setas que avançam um cartão por vez, desativadas nas pontas (com movimento reduzido, o salto é instantâneo);
 * - contador "01 / 08" e barra de progresso da rolagem (decorativos: quem usa leitor de tela percorre os cartões);
 * - `data-at-start` / `data-at-end` na faixa, que o CSS usa para esmaecer só as bordas que ainda têm conteúdo.
 * A faixa continua rolável sem nada disso (arrasto, roda do mouse, teclado); sem JavaScript, os controles nem
 * aparecem (CSS `.carousel-controls`).
 */
export function CarouselControls({
  targetId,
  prevLabel,
  nextLabel,
}: {
  targetId: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const [state, setState] = useState({ start: true, end: false, index: 1, total: 0, progress: 0 });

  useEffect(() => {
    const track = document.getElementById(targetId);
    if (!track) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = Math.max(1, track.scrollWidth - track.clientWidth);
      const start = track.scrollLeft <= 4;
      const end = track.scrollLeft >= max - 4;
      const card = track.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = card ? card.offsetWidth + gap : track.clientWidth;
      const total = track.children.length;
      const index = end ? total : Math.min(total, Math.round(track.scrollLeft / step) + 1);
      track.toggleAttribute("data-at-start", start);
      track.toggleAttribute("data-at-end", end);
      setState({ start, end, index, total, progress: Math.min(1, track.scrollLeft / max) });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [targetId]);

  function go(direction: 1 | -1) {
    const track = document.getElementById(targetId);
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: reduce ? "auto" : "smooth",
    });
  }

  const button = cn(
    buttonVariants({ variant: "secondary", size: "icon" }),
    "disabled:pointer-events-none disabled:opacity-35"
  );
  return (
    <div className="carousel-controls items-center gap-4">
      <div aria-hidden="true" className="hidden items-center gap-3 sm:flex">
        <span className="font-mono text-[0.8rem] tracking-[0.08em] text-text-2 tabular-nums">
          {pad(state.index)} <span className="text-text-3">/ {pad(state.total || 1)}</span>
        </span>
        <span className="relative h-0.5 w-24 overflow-hidden rounded-full bg-line">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${Math.max(8, state.progress * 100)}%` }}
          />
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className={button}
          aria-label={prevLabel}
          aria-controls={targetId}
          disabled={state.start}
          onClick={() => go(-1)}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          className={button}
          aria-label={nextLabel}
          aria-controls={targetId}
          disabled={state.end}
          onClick={() => go(1)}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
