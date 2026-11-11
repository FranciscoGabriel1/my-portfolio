import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SplitText } from "@/components/motion/SplitText";

describe("SplitText", () => {
  it("expõe a frase inteira uma vez ao leitor de tela e esconde as palavras", () => {
    const { container, getByRole } = render(<SplitText as="h2" text="O que já construí" />);

    expect(getByRole("heading", { level: 2, name: "O que já construí" })).toBeInTheDocument();

    const visible = container.querySelector('[aria-hidden="true"]');
    expect(visible?.querySelectorAll(".split-word")).toHaveLength(4);
    expect(container.querySelector(".sr-only")?.textContent).toBe("O que já construí");
  });

  it("numera as palavras para o atraso em cascata", () => {
    const { container } = render(<SplitText text="Francisco Marinho" as="h1" mode="load" />);
    const words = [...container.querySelectorAll<HTMLElement>(".split-word")];
    expect(words.map((w) => w.style.getPropertyValue("--i"))).toEqual(["0", "1"]);
  });

  it("entra ao rolar no modo reveal e ao carregar no modo load", () => {
    const reveal = render(<SplitText text="Contato" />).container.firstElementChild;
    expect(reveal).toHaveAttribute("data-reveal", "split");

    const load = render(<SplitText text="Francisco Marinho" as="h1" mode="load" />).container.firstElementChild;
    expect(load).toHaveAttribute("data-split", "load");
    expect(load).not.toHaveAttribute("data-reveal");
  });
});
