import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SKILL_GROUPS, type Skill } from "@/lib/content/skills";
import { TECH_ICON_COLORS } from "@/lib/content/tech-icon-colors";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

const MESSAGES = { pt, en, es };
type Skills = Record<string, { label: string; items: Record<string, string> }>;
const sprite = readFileSync(path.join(process.cwd(), "public/icons/tech.svg"), "utf-8");

describe("conteúdo das competências", () => {
  it.each(Object.keys(MESSAGES))(
    "os grupos e as tecnologias de lib/content/skills.ts têm nome em %s, sem sobras",
    (locale) => {
      const skills = (
        MESSAGES[locale as keyof typeof MESSAGES].about as unknown as { skills: Skills }
      ).skills;
      expect(Object.keys(skills)).toEqual(SKILL_GROUPS.map((g) => g.id));
      for (const group of SKILL_GROUPS) {
        expect(skills[group.id].label, `${locale}: ${group.id}`).toBeTruthy();
        expect(Object.keys(skills[group.id].items)).toEqual(group.items.map((i) => i.id));
        for (const item of group.items)
          expect(skills[group.id].items[item.id], `${locale}: ${item.id}`).toBeTruthy();
      }
    }
  );

  it("todo ícone existe na folha de símbolos e tem cor de hover nos dois temas", () => {
    for (const item of SKILL_GROUPS.flatMap((g): Skill[] => [...g.items])) {
      expect(sprite, item.icon).toContain(`<symbol id="${item.icon}"`);
      expect(TECH_ICON_COLORS[item.icon]?.light, item.icon).toBeTruthy();
      expect(TECH_ICON_COLORS[item.icon]?.dark, item.icon).toBeTruthy();
    }
  });
});
