import type { CSSProperties } from "react";
import { SIGNATURE } from "@/lib/brand/signature-data";

/**
 * Logomarca: assinatura desenhada, temporária até o dono ter uma oficial (para trocar, substituir os desenhos em
 * lib/brand/signature-data.ts). Componente de servidor, passado ao cabeçalho pela página: o desenho vai só no HTML,
 * nada no JavaScript.
 *
 * Movimento (CSS em `.signature`, globals.css; nada com movimento reduzido):
 * - entrada: cada letra tem o contorno traçado e depois é preenchida, em sequência; o sublinhado vem por último;
 * - depois, um brilho na cor de acento atravessa as letras a cada 7 s (retângulo com degradê, recortado pelas letras).
 */
export function Signature() {
  const { viewBox, width, glyphs, swoosh } = SIGNATURE;
  const [x, y, , h] = viewBox.split(" ").map(Number);
  const shineW = Math.round(width * 0.28);
  const style = { "--n": glyphs.length, "--sweep": `${width + shineW}px` } as CSSProperties;

  return (
    <svg className="signature" viewBox={viewBox} aria-hidden="true" focusable="false" style={style}>
      <defs>
        <clipPath id="signature-letters">
          {/* O recorte reaproveita as letras desenhadas abaixo, sem repetir os desenhos no HTML. */}
          {glyphs.map((_, i) => (
            <use key={i} href={`#signature-letter-${i}`} />
          ))}
        </clipPath>
        <linearGradient
          id="signature-shine"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="rotate(18 .5 .5)"
        >
          <stop offset="0" className="signature-stop" />
          <stop offset=".5" className="signature-stop signature-stop-mid" />
          <stop offset="1" className="signature-stop" />
        </linearGradient>
      </defs>
      <g>
        {glyphs.map((d, i) => (
          <path
            key={i}
            id={`signature-letter-${i}`}
            className="signature-letter"
            pathLength={1}
            d={d}
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </g>
      <path className="signature-swoosh" pathLength={1} d={swoosh} />
      <g clipPath="url(#signature-letters)">
        <rect
          className="signature-shine"
          x={x - shineW}
          y={y}
          width={shineW}
          height={h}
          fill="url(#signature-shine)"
        />
      </g>
    </svg>
  );
}
