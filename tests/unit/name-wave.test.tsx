import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NameWave } from "@/components/motion/NameWave";
import { SplitText } from "@/components/motion/SplitText";

function setMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
}

function mount() {
  const view = render(
    <>
      <SplitText as="h1" id="nome" mode="load" letters text="Ana Lu" />
      <NameWave targetId="nome" />
    </>
  );
  const title = view.container.querySelector<HTMLElement>("#nome")!;
  const chars = [...title.querySelectorAll<HTMLElement>(".split-char")];
  // Letras lado a lado, 50 px cada, numa linha só.
  chars.forEach((el, i) => {
    el.getBoundingClientRect = () => ({ left: i * 50, width: 50, top: 0, height: 100 }) as DOMRect;
  });
  return { title, chars };
}

const pointer = (type: string, x: number) => {
  const e = new Event(type, { bubbles: true }) as PointerEvent;
  Object.assign(e, { clientX: x, clientY: 50 });
  return e;
};

describe("NameWave", () => {
  const raf = window.requestAnimationFrame;
  afterEach(() => {
    cleanup();
    window.requestAnimationFrame = raf;
  });

  it("levanta as letras perto do ponteiro e solta quando ele sai", () => {
    setMedia(true);
    // Quadro imediato; devolve 0 para o componente não achar que ainda há um quadro pendente.
    window.requestAnimationFrame = (cb: FrameRequestCallback) => (cb(0), 0);
    const { title, chars } = mount();

    act(() => void title.dispatchEvent(pointer("pointerenter", 25)));
    const waves = chars.map((c) => Number(c.style.getPropertyValue("--wave")));
    expect(waves[0]).toBeGreaterThan(0.9);
    expect(waves[0]).toBeGreaterThan(waves[2]);

    act(() => void title.dispatchEvent(new Event("pointerleave")));
    expect(chars.every((c) => c.style.getPropertyValue("--wave") === "0")).toBe(true);
  });

  it("não faz nada com movimento reduzido ou sem ponteiro fino", () => {
    setMedia(false);
    const { title, chars } = mount();
    act(() => void title.dispatchEvent(pointer("pointerenter", 25)));
    expect(chars.every((c) => c.style.getPropertyValue("--wave") === "")).toBe(true);
  });
});
