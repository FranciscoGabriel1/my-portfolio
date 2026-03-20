"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** original slow drift */
  driftX: number;
  driftY: number;
  size: number;
  opacity: number;
  /** 0-1 flicker phase offset */
  phase: number;
}

interface ParticlesProps {
  /** Number of particles */
  count?: number;
  /** Radius around the cursor that repels particles (px) */
  repelRadius?: number;
  /** Repulsion force multiplier */
  repelStrength?: number;
}

export function Particles({
  count = 65,
  repelRadius = 120,
  repelStrength = 3,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Size canvas to its rendered box ──────────────────────────────────
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Build particles ──────────────────────────────────────────────────
    let particles: Particle[] = [];
    const scatter = () => {
      particles = Array.from({ length: count }, () => {
        const drift = 0.25;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * drift,
          vy: (Math.random() - 0.5) * drift,
          driftX: (Math.random() - 0.5) * drift,
          driftY: (Math.random() - 0.5) * drift,
          size: Math.random() * 1.8 + 0.4,
          opacity: Math.random() * 0.45 + 0.1,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };
    scatter();

    // ── Read accent color from CSS var ──────────────────────────────────
    const rootStyle = getComputedStyle(document.documentElement);
    const hex = rootStyle.getPropertyValue("--accent-primary").trim() || "#007aff";
    // Convert hex → rgb for rgba()
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // ── Animation loop ──────────────────────────────────────────────────
    let tick = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      const { x: mx, y: my, active } = mouseRef.current;

      for (const p of particles) {
        // Mouse repulsion
        if (active) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;
          const radiusSq = repelRadius * repelRadius;

          if (distSq < radiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = ((repelRadius - dist) / repelRadius) ** 2;
            p.vx += (dx / dist) * force * repelStrength;
            p.vy += (dy / dist) * force * repelStrength;
          }
        }

        // Gently restore to drift velocity
        p.vx += (p.driftX - p.vx) * 0.018;
        p.vy += (p.driftY - p.vy) * 0.018;

        // Damping
        p.vx *= 0.96;
        p.vy *= 0.96;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -4) p.x = canvas.width + 4;
        else if (p.x > canvas.width + 4) p.x = -4;
        if (p.y < -4) p.y = canvas.height + 4;
        else if (p.y > canvas.height + 4) p.y = -4;

        // Subtle flicker
        const flicker = 0.85 + 0.15 * Math.sin(tick * 0.018 + p.phase);
        const alpha = p.opacity * flicker;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    // ── Mouse events on the parent section ──────────────────────────────
    const section = canvas.closest("section") ?? document.body;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
    };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [count, repelRadius, repelStrength, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
