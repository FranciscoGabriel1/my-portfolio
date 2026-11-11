/**
 * Competências (spec secao-de-tecnologias): ordem dos grupos e das tecnologias, ícone de cada uma e a marca do
 * CurrículoRaiz. Os nomes ficam em `messages/*.json` (`about.skills.<grupo>.items.<id>`).
 *
 * Ícones: `si-<slug>` vem do Simple Icons (logotipo da marca) e `lu-<nome>` do lucide, quando não há logotipo.
 * Os dois vivem em public/icons/tech.svg, gerado por scripts/tech-icons/build.mjs a partir desta lista.
 * `cr`: usado no CurrículoRaiz (conferido no repositório dele em 2026-11-11).
 *
 * Lista enxuta aprovada pelo dono em 2026-11-11 (cerca de 30 nos cartões): o que é esperado de um sênior ou é
 * detalhe de ferramenta fica numa linha de texto no fim (`about.skills_extra`), sem logotipo.
 */

export interface Skill {
  id: string;
  icon: string;
  cr?: boolean;
}

export const SKILL_GROUPS = [
  {
    id: "frontend",
    items: [
      { id: "react", icon: "si-react", cr: true },
      { id: "nextjs", icon: "si-nextdotjs" },
      { id: "typescript", icon: "si-typescript", cr: true },
      { id: "tailwind", icon: "si-tailwindcss", cr: true },
      { id: "angular", icon: "si-angular" },
      { id: "threejs", icon: "si-threedotjs" },
    ],
  },
  {
    id: "state_tools",
    items: [
      { id: "redux", icon: "si-redux" },
      { id: "zustand", icon: "lu-layers", cr: true },
      { id: "tanstack_query", icon: "si-reactquery", cr: true },
      { id: "storybook", icon: "si-storybook" },
      { id: "figma", icon: "si-figma" },
      { id: "design_system", icon: "lu-component" },
    ],
  },
  {
    id: "backend_infra",
    items: [
      { id: "node", icon: "si-nodedotjs", cr: true },
      { id: "prisma", icon: "si-prisma", cr: true },
      { id: "postgres_neon", icon: "si-neon", cr: true },
      { id: "docker", icon: "si-docker", cr: true },
      { id: "cloud_run", icon: "si-googlecloud", cr: true },
      { id: "cloudflare", icon: "si-cloudflare", cr: true },
      { id: "aws", icon: "lu-cloud" },
    ],
  },
  {
    id: "product",
    items: [
      { id: "mercado_pago", icon: "si-mercadopago", cr: true },
      { id: "google_login", icon: "si-google", cr: true },
      { id: "growthbook", icon: "lu-flag", cr: true },
      { id: "puppeteer", icon: "si-puppeteer", cr: true },
    ],
  },
  {
    id: "quality",
    items: [
      { id: "jest", icon: "si-jest", cr: true },
      { id: "rtl", icon: "si-testinglibrary" },
      { id: "cypress", icon: "si-cypress" },
      { id: "playwright", icon: "lu-drama" },
      { id: "lighthouse", icon: "si-lighthouse" },
      { id: "wcag", icon: "lu-accessibility" },
    ],
  },
  {
    id: "ai",
    items: [
      { id: "claude_code", icon: "si-claude", cr: true },
      { id: "openspec", icon: "lu-file-check", cr: true },
      { id: "graphify", icon: "lu-network", cr: true },
    ],
  },
] as const satisfies ReadonlyArray<{ id: string; items: ReadonlyArray<Skill> }>;

export type SkillGroupId = (typeof SKILL_GROUPS)[number]["id"];

export const TECH_SPRITE = "/icons/tech.svg";
