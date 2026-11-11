import { Fragment, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Heading = "h1" | "h2" | "h3" | "p";

interface SplitTextProps {
  text: string;
  as?: Heading;
  /** "load": entra ao carregar, só com CSS (nome do Hero). "reveal": entra ao rolar até ele. */
  mode?: "load" | "reveal";
  /** Divide também em letras: cada letra entra em cascata (e pode receber a onda de `NameWave`). */
  letters?: boolean;
  id?: string;
  className?: string;
}

/**
 * Título revelado palavra por palavra (ou letra por letra), renderizado igual no servidor e no cliente.
 * O leitor de tela lê a frase inteira uma vez (`.sr-only`); as palavras visíveis ficam com `aria-hidden`.
 */
export function SplitText({ text, as: Tag = "h2", mode = "reveal", letters = false, id, className }: SplitTextProps) {
  const words = text.trim().split(/\s+/);
  let charIndex = 0;

  return (
    <Tag
      id={id}
      className={className}
      data-split={mode}
      data-split-letters={letters ? "" : undefined}
      data-reveal={mode === "reveal" ? "split" : undefined}
    >
      <span className={cn("sr-only", "split-sr")}>{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="split-mask">
              <span className="split-word" style={{ "--i": i } as CSSProperties}>
                {letters
                  ? [...word].map((char, j) => (
                      <span key={j} className="split-char" style={{ "--c": charIndex++ } as CSSProperties}>
                        {char}
                      </span>
                    ))
                  : word}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
