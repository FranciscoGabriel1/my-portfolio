/**
 * Gera a folha de símbolos das competências (public/icons/tech.svg) e as cores de hover de cada ícone
 * (lib/content/tech-icon-colors.ts) a partir dos ids de ícone em lib/content/skills.ts.
 *
 * - `si-<slug>`: logotipo do Simple Icons (CC0). O pacote não é dependência do projeto: baixe-o à parte e
 *   aponte SIMPLE_ICONS_DIR para a pasta dele, por exemplo:
 *     mkdir -p /tmp/si && (cd /tmp/si && npm pack simple-icons && tar xzf simple-icons-*.tgz)
 *     SIMPLE_ICONS_DIR=/tmp/si/package node scripts/tech-icons/build.mjs
 * - `lu-<nome>`: ícone do lucide-react (já instalado), para o que não tem logotipo.
 *
 * Cor de hover: a da marca, ou a do texto (`var(--text)`) quando ela fica abaixo de 2,2:1 contra a superfície
 * das tecnologias no tema (claro #eae5da, escuro #1d1c19). Ícones do lucide usam a cor de acento de texto.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const siDir = process.env.SIMPLE_ICONS_DIR;
if (!siDir) {
  console.error("Defina SIMPLE_ICONS_DIR (veja o comentário no topo do arquivo).");
  process.exit(1);
}

const source = fs.readFileSync(path.join(root, "lib/content/skills.ts"), "utf-8");
const ids = [...new Set([...source.matchAll(/icon: "((?:si|lu)-[a-z0-9-]+)"/g)].map((m) => m[1]))];

const si = await import(pathToFileURL(path.join(siDir, "index.mjs")).href);
const bySlug = Object.fromEntries(Object.values(si).map((i) => [i.slug, i]));

const SURFACE = { light: "eae5da", dark: "1d1c19" };
const lum = (hex) => {
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const symbols = [];
const colors = {};
for (const id of ids) {
  const [kind, ...rest] = id.split("-");
  const name = rest.join("-");
  if (kind === "si") {
    const icon = bySlug[name];
    if (!icon) throw new Error(`Simple Icons não tem "${name}"`);
    symbols.push(
      `<symbol id="${id}" viewBox="0 0 24 24"><path fill="currentColor" d="${icon.path}"/></symbol>`
    );
    colors[id] = Object.fromEntries(
      Object.entries(SURFACE).map(([theme, bg]) => [
        theme,
        contrast(icon.hex, bg) >= 2.2 ? `#${icon.hex}` : "var(--text)",
      ])
    );
  } else {
    const file = path.join(root, "node_modules/lucide-react/dist/esm/icons", `${name}.mjs`);
    const { __iconData } = await import(pathToFileURL(file).href);
    const inner = __iconData.node
      .map(
        ([tag, attrs]) =>
          `<${tag} ${Object.entries(attrs)
            .filter(([k]) => k !== "key")
            .map(([k, v]) => `${k}="${v}"`)
            .join(" ")}/>`
      )
      .join("");
    symbols.push(
      `<symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`
    );
    colors[id] = { light: "var(--accent-text)", dark: "var(--accent-text)" };
  }
}

const sprite = `<svg xmlns="http://www.w3.org/2000/svg"><!-- Gerado por scripts/tech-icons/build.mjs. Logotipos: Simple Icons (CC0); ícones: lucide (ISC). -->${symbols.join("")}</svg>\n`;
fs.mkdirSync(path.join(root, "public/icons"), { recursive: true });
fs.writeFileSync(path.join(root, "public/icons/tech.svg"), sprite);

const ts = `// Gerado por scripts/tech-icons/build.mjs: não editar à mão.
/** Cor do ícone no hover, por tema: a da marca, ou a do texto quando ela some na superfície do tema. */
export const TECH_ICON_COLORS: Record<string, { light: string; dark: string }> = ${JSON.stringify(colors, null, 2)};
`;
fs.writeFileSync(path.join(root, "lib/content/tech-icon-colors.ts"), ts);
console.log(`${ids.length} ícones; tech.svg com ${Math.round(sprite.length / 1024)} kB`);
