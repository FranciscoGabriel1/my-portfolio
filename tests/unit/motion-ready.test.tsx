import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MotionReady } from "@/components/motion/MotionReady";

function placeAt(el: HTMLElement, top: number) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ top } as DOMRect);
}

describe("MotionReady", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute("data-motion");
  });

  it("revela o que já está na tela antes de liberar o CSS que esconde", () => {
    document.body.innerHTML = `
      <section data-reveal="self" id="na-tela"></section>
      <section data-reveal="self" id="abaixo"><a href="#x">link</a></section>`;
    placeAt(document.getElementById("na-tela")!, 100);
    placeAt(document.getElementById("abaixo")!, window.innerHeight + 500);

    render(<MotionReady />);

    expect(document.documentElement).toHaveAttribute("data-motion", "ready");
    expect(document.getElementById("na-tela")).toHaveAttribute("data-revealed");
    expect(document.getElementById("abaixo")).not.toHaveAttribute("data-revealed");
  });

  it("revela na hora o bloco que recebe foco pelo teclado", () => {
    document.body.innerHTML = `<section data-reveal="children" id="abaixo"><a href="#x">link</a></section>`;
    placeAt(document.getElementById("abaixo")!, window.innerHeight + 500);
    render(<MotionReady />);

    document.querySelector("a")!.focus();

    expect(document.getElementById("abaixo")).toHaveAttribute("data-revealed");
  });

  it("desmontado, deixa de esconder o conteúdo", () => {
    document.body.innerHTML = `<section data-reveal="self"></section>`;
    const { unmount } = render(<MotionReady />);
    unmount();
    expect(document.documentElement).not.toHaveAttribute("data-motion");
  });
});
