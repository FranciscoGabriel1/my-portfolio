"use client";

import { useEffect, useRef } from "react";
import { canRunScene, readSceneEnv } from "@/lib/scene/can-run-scene";
import type { HeroScene, SceneState, SceneTheme } from "./hero-scene";

type LoaderState = SceneState | "loading" | "captured";

const themeNow = (): SceneTheme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

/**
 * Portão e carregamento da cena 3D do Hero (design, decisão 2). Fica dentro do contêiner `.hero-scene`,
 * cuja imagem de fundo é a versão sem 3D; o estado vai em `data-scene-state` no contêiner.
 *
 * - Só roda se `canRunScene` deixar (movimento reduzido, WebGL, economia de dados, aparelho fraco).
 * - Só começa depois do `load` e da primeira interação, com o navegador ocioso e o Hero perto da tela.
 * - Movimento reduzido ligado depois, falha ou perda do contexto WebGL: a cena some e a imagem volta.
 * - `?scene-capture` (usado por scripts/render-scene-posters.ts) monta a cena parada, para gerar o pôster.
 */
export function HeroSceneLoader() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = markerRef.current?.parentElement;
    if (!container) return;
    const setState = (state: LoaderState) => (container.dataset.sceneState = state);
    const capture = new URLSearchParams(window.location.search).has("scene-capture");
    // Testes em navegador sem GPU: a cena não desiste por lentidão (ver tests/e2e/cena.spec.ts).
    const testMode = (window as Window & { __SCENE_TEST__?: boolean }).__SCENE_TEST__ === true;

    if (!capture && !canRunScene(readSceneEnv())) {
      setState("poster");
      return;
    }

    let scene: HeroScene | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const themeObserver = new MutationObserver(() => scene?.setTheme(themeNow()));

    const toPoster = () => {
      scene?.destroy();
      scene = null;
      setState("poster");
    };
    const onReduce = () => {
      if (reduce.matches) toPoster();
    };

    async function boot() {
      if (cancelled) return;
      setState("loading");
      try {
        const { createHeroScene } = await import("./hero-scene");
        if (cancelled) return;
        const created = await createHeroScene(container!, {
          theme: themeNow(),
          coarse: window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900,
          capture,
          noDowngrade: capture || testMode,
          onState: (state) => {
            setState(state);
            if (state === "poster") scene = null;
          },
        });
        if (cancelled) {
          created.destroy();
          return;
        }
        scene = created;
        if (capture) setState("captured");
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      } catch {
        if (!cancelled) setState("poster");
      }
    }

    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => void boot(), { timeout: 2000 });
      else setTimeout(() => void boot(), 200);
    };
    // A cena começa na primeira interação (ponteiro, rolagem, toque ou teclado), com o Hero perto da tela: a
    // montagem nunca disputa o carregamento inicial (design, decisão 9). A captura do pôster começa direto.
    const INTERACTIONS = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;
    const onFirstInteraction = () => {
      INTERACTIONS.forEach((type) => window.removeEventListener(type, onFirstInteraction));
      observe();
    };
    const start = () => {
      if (capture) observe();
      else INTERACTIONS.forEach((type) => window.addEventListener(type, onFirstInteraction, { passive: true, once: true }));
    };
    const observe = () => {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          io?.disconnect();
          whenIdle();
        },
        { rootMargin: "200px" }
      );
      io.observe(container);
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    reduce.addEventListener("change", onReduce);

    return () => {
      cancelled = true;
      io?.disconnect();
      themeObserver.disconnect();
      reduce.removeEventListener("change", onReduce);
      window.removeEventListener("load", start);
      INTERACTIONS.forEach((type) => window.removeEventListener(type, onFirstInteraction));
      scene?.destroy();
    };
  }, []);

  return <span ref={markerRef} hidden />;
}
