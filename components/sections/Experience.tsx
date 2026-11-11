import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { SplitText } from "@/components/motion/SplitText";
import {
  currentYearMonth,
  EDUCATION,
  EXPERIENCE,
  RULER_FIRST_YEAR,
  rulerBar,
  rulerYears,
  type YearMonth,
} from "@/lib/content/career";
import { cn } from "@/lib/utils";

const INTL_LOCALE: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };
const ROW = 58; // px entre as barras da régua

/** "out 2025": mês curto sem ponto, no idioma da página. O CSS põe em caixa alta. */
function formatMonth(ym: YearMonth, locale: string) {
  const [year, month] = ym.split("-").map(Number);
  const name = new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? locale, { month: "short", timeZone: "UTC" })
    .format(Date.UTC(year, month - 1, 15))
    .replace(".", "");
  return `${name} ${year}`;
}

/** Trajetória, de servidor: régua decorativa (computador), vínculos em lista e formação. */
export async function Experience() {
  const t = await getTranslations("experience");
  const tEdu = await getTranslations("education");
  const locale = await getLocale();
  // Página estática: a régua usa o mês do build.
  const now = currentYearMonth();
  const years = rulerYears(now);
  const spanMonths = (years.length) * 12;
  const yearLeft = (year: number) => `${((year - RULER_FIRST_YEAR) * 12 * 100) / spanMonths}%`;
  const nowEnd = rulerBar({ start: now, end: now }, now);
  const oldestFirst = [...EXPERIENCE].reverse();

  return (
    <section id="experience" aria-labelledby="experience-title" className="band-alt py-24 lg:py-40">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <div>
            <p className="type-eyebrow mb-5 text-accent-text">
              <span aria-hidden="true">04 — </span>
              {t("label")}
            </p>
            <SplitText id="experience-title" text={t("title")} className="type-display text-text" />
          </div>
          {/* O subtítulo descreve a régua, então aparece só onde ela aparece. */}
          <p className="type-lead hidden nav:block">{t("subtitle")}</p>
        </div>

        {/* Régua: decorativa, porque a lista abaixo traz a mesma informação. Some abaixo de 900 px. */}
        <div
          aria-hidden="true"
          data-reveal="ruler"
          className="ruler relative mt-16 hidden nav:block lg:mt-20"
          style={{ height: oldestFirst.length * ROW + 34 }}
        >
          {years.map((year) => (
            <div key={year} className="absolute top-0 bottom-0 w-px bg-line" style={{ left: yearLeft(year) }}>
              <span className="absolute bottom-0 left-2 font-mono text-[0.72rem] text-text-3">{year}</span>
            </div>
          ))}
          {oldestFirst.map((job, i) => {
            const { left, width } = rulerBar(job, now);
            const current = job.end === null;
            const note = t.has(`items.${job.id}.bar_note`) ? t(`items.${job.id}.bar_note`) : null;
            return (
              <div
                key={job.id}
                className={cn(
                  "ruler-bar absolute flex h-11 items-center overflow-hidden rounded-lg px-3.5 text-[0.9rem] font-semibold whitespace-nowrap",
                  current ? "bg-accent text-on-accent" : "bg-surface-2 text-text"
                )}
                style={{ left: `${left}%`, width: `${width}%`, top: i * ROW, "--i": i } as CSSProperties}
              >
                {job.company}
                {note && <span className="ml-2 font-normal text-text-2">· {note}</span>}
              </div>
            );
          })}
          <div
            className="absolute top-0 bottom-[22px] w-0.5 bg-accent"
            style={{ left: `${nowEnd.left + nowEnd.width}%` }}
          />
        </div>

        <ol className="mt-14 border-t border-line lg:mt-16">
          {EXPERIENCE.map((job) => {
            const item = (key: string) => t(`items.${job.id}.${key}`);
            const current = job.end === null;
            const meta = [job.company, item("location"), t.has(`items.${job.id}.type`) ? item("type") : null]
              .filter(Boolean)
              .join(" · ");
            return (
              <li
                key={job.id}
                data-reveal="self"
                className="grid gap-x-10 gap-y-2 border-b border-line py-6 lg:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1.2fr)] lg:py-7"
              >
                <p className={cn("type-eyebrow pt-1", current && "text-accent-text")}>
                  {formatMonth(job.start, locale)} — {job.end ? formatMonth(job.end, locale) : t("present")}
                </p>
                <div>
                  <h3 className="font-display text-xl font-bold text-text">{item("role")}</h3>
                  <p className="mt-1 text-[0.95rem] text-text-2">{meta}</p>
                </div>
                <p className="leading-relaxed text-text-2">{item("description")}</p>
              </li>
            );
          })}
        </ol>

        <h3 className="type-eyebrow mt-16 lg:mt-20">{tEdu("label")}</h3>
        <ul data-reveal="children" className="mt-6 grid gap-x-8 gap-y-8 lg:grid-cols-3">
          {EDUCATION.map((edu) => {
            const item = (key: string) => tEdu(`items.${edu.id}.${key}`);
            const years = `${edu.start.slice(0, 4)} — ${edu.end?.slice(0, 4)}`;
            return (
              <li key={edu.id} className="border-t border-line pt-5">
                <h4 className="font-display text-xl font-bold text-text">{item("degree")}</h4>
                <p className="mt-1 text-text-2">
                  {item("institution")} · {item("location")}
                </p>
                <p className="mt-2 text-[0.9rem] text-text-3">
                  {years}
                  {tEdu.has(`items.${edu.id}.description`) && <> · {item("description")}</>}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
