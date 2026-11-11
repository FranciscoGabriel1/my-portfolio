import type { CSSProperties } from "react";
import { getMessages, getTranslations } from "next-intl/server";
import { CardGlow } from "@/components/motion/CardGlow";
import { SKILL_GROUPS, TECH_SPRITE, type SkillGroupId } from "@/lib/content/skills";
import { TECH_ICON_COLORS } from "@/lib/content/tech-icon-colors";

interface SkillsMessages {
  about: { skills: Record<SkillGroupId, { label: string; items: Record<string, string> }> };
}

const GRID_ID = "tech-grid";

function TechIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className}>
      <use href={`${TECH_SPRITE}#${id}`} />
    </svg>
  );
}

/**
 * Competências (spec secao-de-tecnologias), de servidor: cabeçalho com a legenda do CurrículoRaiz e seis cartões.
 * Movimento só em CSS; a ilha de cliente só acende o brilho do cartão.
 */
export async function Skills() {
  const t = await getTranslations("about");
  const { about } = (await getMessages()) as unknown as SkillsMessages;

  return (
    <div className="mt-20 lg:mt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <p className="type-eyebrow">{t("skills_title")}</p>
          <h3 className="mt-3 max-w-[18ch] type-title text-text">{t("skills_heading")}</h3>
        </div>
        <p className="flex items-center gap-2.5 text-text-2">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          {t("skills_legend")}
        </p>
      </div>

      <div id={GRID_ID} data-reveal="children" className="tech-grid mt-10">
        {SKILL_GROUPS.map((group) => {
          const { label, items } = about.skills[group.id];
          return (
            <div key={group.id} className="tech-card">
              <header className="mb-5 flex items-baseline justify-between gap-3">
                <h4 className="font-display text-xl font-bold text-text">{label}</h4>
                <span
                  aria-hidden="true"
                  className="font-mono text-[0.78rem] tracking-[0.1em] text-text-3"
                >
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </header>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item, i) => {
                  const color = TECH_ICON_COLORS[item.icon];
                  const style = {
                    "--i": i,
                    "--cl": color?.light,
                    "--cd": color?.dark,
                  } as CSSProperties;
                  return (
                    <li key={item.id} className="tech-chip" style={style}>
                      <TechIcon id={item.icon} />
                      <span>{items[item.id]}</span>
                      {"cr" in item && item.cr ? (
                        <span className="tech-cr">
                          <span className="sr-only"> ({t("skills_cr_sr")})</span>
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-8 max-w-[90ch] leading-relaxed text-text-2">
        <span className="font-semibold text-text">{t("skills_extra_label")}:</span>{" "}
        {t("skills_extra")}
      </p>
      <CardGlow targetId={GRID_ID} />
    </div>
  );
}
