"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo do Hero, decorativo: uma constelação de peças. Estrelas que cintilam e formas geométricas (círculo, triângulo,
 * quadrado, hexágono e cruz) em três profundidades, girando e derivando devagar. O ponteiro desloca as camadas em
 * paralaxe, afasta e acende as peças próximas e liga as estrelas vizinhas a ele por linhas; de vez em quando passa uma
 * estrela cadente. Canvas 2D, sem biblioteca.
 *
 * - Começa depois do `load`, com o navegador ocioso, e entra com esmaecimento: não disputa o LCP.
 * - Pausa fora da tela e com a aba oculta. Com movimento reduzido, desenha um quadro parado e não reage ao ponteiro.
 * - Cores lidas dos tokens (`--text-3`, `--line-strong`, `--accent`) e relidas na troca de tema.
 * - Sem JavaScript, o canvas fica vazio e o Hero mostra só a trama da faixa.
 */

type Kind = "star" | "circle" | "triangle" | "square" | "hex" | "plus";

interface Body {
  kind: Kind;
  /** Posição base, de 0 a 1 na largura e na altura. */
  x: number;
  y: number;
  /** Profundidade: 0,3 (fundo) a 1 (frente). Escala o tamanho, o brilho, a deriva e a paralaxe. */
  z: number;
  size: number;
  rot: number;
  spin: number;
  vx: number;
  vy: number;
  phase: number;
  accent: boolean;
  /** Empurrão do ponteiro e brilho extra, suavizados a cada quadro. */
  ox: number;
  oy: number;
  glow: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const SHAPES: Kind[] = ["circle", "triangle", "square", "hex", "plus"];
/** Raio de alcance do ponteiro, em px. */
const REACH = 170;
const PARALLAX = 36;
/** A partir daqui o Hero tem duas colunas, com o texto à esquerda (breakpoint `lg`). */
const TWO_COLUMNS = 1024;

/**
 * Esmaecimento do lado do texto, no próprio desenho: uma máscara de CSS no canvas obrigaria a recompor a camada a
 * cada quadro e derrubava a taxa de quadros pela metade. Em uma coluna, o texto ocupa a largura toda.
 */
function fadeAt(x: number, w: number): number {
  if (w < TWO_COLUMNS) return 0.35;
  const k = x / w;
  if (k < 0.4) return 0.22 + 0.08 * (k / 0.4);
  if (k < 0.62) return 0.3 + 0.7 * ((k - 0.4) / 0.22);
  return 1;
}

/** Gerador com semente: o céu é o mesmo a cada visita e a cada captura. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createBodies(stars: number, shapes: number): Body[] {
  const rand = mulberry32(20261118);
  const bodies: Body[] = [];
  for (let i = 0; i < stars + shapes; i++) {
    const star = i < stars;
    const z = 0.3 + rand() * 0.7;
    bodies.push({
      kind: star ? "star" : SHAPES[Math.floor(rand() * SHAPES.length)],
      x: rand(),
      y: rand(),
      z,
      size: star ? 0.6 + rand() * 1.1 : 7 + rand() * 15,
      rot: rand() * Math.PI * 2,
      spin: (rand() - 0.5) * 0.25,
      vx: (rand() - 0.5) * 4,
      vy: -1.5 - rand() * 3,
      phase: rand() * Math.PI * 2,
      accent: !star && rand() < 0.3,
      ox: 0,
      oy: 0,
      glow: 0,
    });
  }
  return bodies;
}

function polygon(ctx: CanvasRenderingContext2D, sides: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawShape(ctx: CanvasRenderingContext2D, kind: Kind, r: number) {
  switch (kind) {
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "triangle":
      polygon(ctx, 3, r);
      break;
    case "square":
      ctx.strokeRect(-r * 0.75, -r * 0.75, r * 1.5, r * 1.5);
      break;
    case "hex":
      polygon(ctx, 6, r);
      break;
    case "plus":
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, 0);
      ctx.lineTo(r * 0.6, 0);
      ctx.moveTo(0, -r * 0.6);
      ctx.lineTo(0, r * 0.6);
      ctx.stroke();
      break;
  }
}

export function HeroBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const host = canvas?.parentElement;
    if (!canvas || !ctx || !host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const bodies = createBodies(coarse ? 70 : 140, coarse ? 12 : 26);
    const meteors: Meteor[] = [];
    const colors = { star: "", line: "", accent: "" };
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let nextMeteor = 4;
    let inView = true;
    let started = false;
    // Ponteiro em px dentro do canvas (null = fora) e paralaxe suavizada, de -0,5 a 0,5.
    let pointer: { x: number; y: number } | null = null;
    const par = { x: 0, y: 0, tx: 0, ty: 0 };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors.star = s.getPropertyValue("--text-3").trim();
      colors.line = s.getPropertyValue("--line-strong").trim();
      colors.accent = s.getPropertyValue("--accent").trim();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    function frame(now: number, animate: boolean) {
      const dt = animate && last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const t = now / 1000;
      par.x += (par.tx - par.x) * (animate ? 0.06 : 1);
      par.y += (par.ty - par.y) * (animate ? 0.06 : 1);

      ctx!.clearRect(0, 0, w, h);
      ctx!.lineCap = "round";
      const near: { x: number; y: number; k: number }[] = [];

      for (const b of bodies) {
        if (animate) {
          b.x += (b.vx * b.z * dt) / Math.max(w, 1);
          b.y += (b.vy * b.z * dt) / Math.max(h, 1);
          if (b.y < -0.05) b.y += 1.1;
          if (b.x < -0.05) b.x += 1.1;
          else if (b.x > 1.05) b.x -= 1.1;
          b.rot += b.spin * dt * (1 + b.glow * 4);
        }
        const bx = b.x * w - par.x * PARALLAX * b.z * 2;
        const by = b.y * h - par.y * PARALLAX * b.z * 2;

        // Empurrão e brilho perto do ponteiro.
        let tox = 0;
        let toy = 0;
        let tglow = 0;
        if (pointer && animate) {
          const dx = bx - pointer.x;
          const dy = by - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < REACH && d > 0.01) {
            const k = 1 - d / REACH;
            const push = k * k * (b.kind === "star" ? 18 : 30) * b.z;
            tox = (dx / d) * push;
            toy = (dy / d) * push;
            tglow = k;
          }
        }
        b.ox += (tox - b.ox) * 0.1;
        b.oy += (toy - b.oy) * 0.1;
        b.glow += (tglow - b.glow) * 0.12;
        const x = bx + b.ox;
        const y = by + b.oy;

        if (b.kind === "star") {
          const twinkle = animate ? 0.6 + 0.4 * Math.sin(t * (0.8 + b.z) + b.phase) : 0.8;
          ctx!.globalAlpha =
            Math.min(1, (0.25 + 0.55 * b.z) * twinkle + b.glow * 0.6) * fadeAt(x, w);
          ctx!.fillStyle = b.glow > 0.35 ? colors.accent : colors.star;
          ctx!.beginPath();
          ctx!.arc(x, y, b.size * (0.7 + b.z * 0.6) * (1 + b.glow * 0.8), 0, Math.PI * 2);
          ctx!.fill();
          if (b.glow > 0.05) near.push({ x, y, k: b.glow });
        } else {
          ctx!.globalAlpha =
            Math.min(1, (b.accent ? 0.28 : 0.2) + 0.32 * b.z + b.glow * 0.45) * fadeAt(x, w);
          ctx!.strokeStyle = b.accent || b.glow > 0.4 ? colors.accent : colors.line;
          ctx!.lineWidth = 1 + b.z * 0.6;
          ctx!.save();
          ctx!.translate(x, y);
          ctx!.rotate(b.rot);
          drawShape(ctx!, b.kind, b.size * (0.6 + b.z * 0.6) * (1 + b.glow * 0.25));
          ctx!.restore();
        }
      }

      // Constelação: o ponteiro liga as estrelas próximas, e as vizinhas entre si.
      if (pointer && near.length) {
        ctx!.strokeStyle = colors.accent;
        ctx!.lineWidth = 1;
        for (let i = 0; i < near.length; i++) {
          const a = near[i];
          ctx!.globalAlpha = a.k * 0.4 * fadeAt(a.x, w);
          ctx!.beginPath();
          ctx!.moveTo(pointer.x, pointer.y);
          ctx!.lineTo(a.x, a.y);
          ctx!.stroke();
          for (let j = i + 1; j < near.length; j++) {
            const c = near[j];
            const d = Math.hypot(a.x - c.x, a.y - c.y);
            if (d > 90) continue;
            ctx!.globalAlpha = Math.min(a.k, c.k) * (1 - d / 90) * 0.35 * fadeAt(a.x, w);
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(c.x, c.y);
            ctx!.stroke();
          }
        }
      }

      // Estrela cadente, de tempos em tempos, na metade de cima.
      if (animate) {
        nextMeteor -= dt;
        if (nextMeteor <= 0 && w > 0) {
          nextMeteor = 7 + Math.random() * 8;
          const fromLeft = Math.random() < 0.5;
          meteors.push({
            x: fromLeft ? Math.random() * w * 0.5 : w * (0.5 + Math.random() * 0.5),
            y: Math.random() * h * 0.35,
            vx: (fromLeft ? 1 : -1) * (520 + Math.random() * 260),
            vy: 180 + Math.random() * 120,
            life: 1,
          });
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.life -= dt * 1.1;
          if (m.life <= 0) {
            meteors.splice(i, 1);
            continue;
          }
          const tail = 0.12;
          const grad = ctx!.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
          grad.addColorStop(0, colors.accent);
          grad.addColorStop(1, "transparent");
          ctx!.globalAlpha = Math.min(1, m.life * 1.4) * 0.8 * fadeAt(m.x, w);
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          ctx!.moveTo(m.x, m.y);
          ctx!.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
          ctx!.stroke();
        }
      }
      ctx!.globalAlpha = 1;
    }

    const loop = (now: number) => {
      raf = 0;
      frame(now, true);
      schedule();
    };
    function schedule() {
      if (!raf && started && inView && !document.hidden && !reduce.matches)
        raf = requestAnimationFrame(loop);
    }
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };
    const drawStill = () => frame(performance.now(), false);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      par.tx = pointer.x / Math.max(w, 1) - 0.5;
      par.ty = pointer.y / Math.max(h, 1) - 0.5;
    };
    const onLeave = () => {
      pointer = null;
      par.tx = 0;
      par.ty = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : schedule());
    const onReduce = () => {
      if (reduce.matches) {
        stop();
        drawStill();
      } else schedule();
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
      else stop();
    });
    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) drawStill();
    });
    const themeObserver = new MutationObserver(() => {
      readColors();
      if (!raf) drawStill();
    });

    let idle = 0;
    const start = () => {
      const begin = () => {
        started = true;
        readColors();
        resize();
        drawStill();
        canvas.dataset.on = "";
        host.addEventListener("pointermove", onMove, { passive: true });
        host.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", onVisibility);
        reduce.addEventListener("change", onReduce);
        io.observe(canvas);
        ro.observe(canvas);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        schedule();
      };
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(begin, { timeout: 1500 });
      else idle = window.setTimeout(begin, 200);
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      stop();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else clearTimeout(idle);
      window.removeEventListener("load", start);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onReduce);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="hero-backdrop" />;
}
