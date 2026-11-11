import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Lê os tokens de cor direto de app/globals.css, para o teste acompanhar qualquer mudança de valor.
const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf-8");

function tokensOf(selector: ":root" | ".dark"): Record<string, string> {
  const start = css.indexOf(`\n${selector} {`);
  if (start < 0) throw new Error(`bloco ${selector} não encontrado em globals.css`);
  const block = css.slice(start, css.indexOf("\n}", start));
  const tokens: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) tokens[name] = value;
  return tokens;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [cor, fundos sobre os quais ela pode aparecer, mínimo]. Restrições da decisão 5 do design.
const RULES: Array<[string, string[], number]> = [
  ["text", ["bg", "surface", "surface-2"], 4.5],
  ["text-2", ["bg", "surface", "surface-2"], 4.5],
  ["text-3", ["bg", "surface"], 4.5],
  ["accent-text", ["bg", "surface", "surface-2"], 4.5],
  ["ok", ["bg", "surface", "surface-2"], 4.5],
  ["danger", ["bg", "surface", "surface-2"], 4.5],
  ["on-accent", ["accent"], 4.5],
  ["line-strong", ["bg", "surface"], 3],
  ["focus", ["bg", "surface", "surface-2"], 3],
];

describe.each([
  ["claro", ":root"],
  ["escuro", ".dark"],
] as const)("contraste dos tokens no tema %s", (_name, selector) => {
  const light = tokensOf(":root");
  // O tema escuro herda de :root o que não redefine.
  const tokens = selector === ":root" ? light : { ...light, ...tokensOf(".dark") };

  it.each(RULES)("--%s sobre %j atinge %s:1", (fg, backgrounds, min) => {
    for (const bg of backgrounds) {
      expect(tokens[fg], `--${fg}`).toBeDefined();
      expect(tokens[bg], `--${bg}`).toBeDefined();
      expect(contrast(tokens[fg], tokens[bg]), `--${fg} sobre --${bg}`).toBeGreaterThanOrEqual(min);
    }
  });

  it("usa o fundo aprovado pelo dono", () => {
    expect(tokens.bg.toLowerCase()).toBe(selector === ".dark" ? "#141311" : "#f4f1ea");
  });
});
