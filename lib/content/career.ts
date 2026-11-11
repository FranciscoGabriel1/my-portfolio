/**
 * Dados estruturais da trajetória: nomes próprios e datas (`AAAA-MM`), que não se traduzem.
 * O texto traduzível (cargo, local, regime, descrição) fica em messages/, em `experience.items.<id>`
 * e `education.items.<id>`.
 */

/** Mês no formato `AAAA-MM`. */
export type YearMonth = `${number}-${number}`;

export interface Period {
  start: YearMonth;
  /** `null` = vínculo atual. */
  end: YearMonth | null;
}

export interface Job extends Period {
  id: string;
  company: string;
}

/** Da mais recente para a mais antiga. */
export const EXPERIENCE: readonly Job[] = [
  { id: "hostgator", company: "HostGator", start: "2025-10", end: null },
  { id: "o2", company: "O2 Filmes", start: "2024-09", end: "2025-12" },
  { id: "atem", company: "Atem", start: "2022-05", end: "2025-05" },
  { id: "sidia", company: "Sidia", start: "2021-04", end: "2022-05" },
  { id: "icomp", company: "iComp UFAM", start: "2019-03", end: "2022-03" },
];

export const EDUCATION: readonly (Period & { id: string })[] = [
  { id: "masters", start: "2019-03", end: "2022-03" },
  { id: "bachelor", start: "2013-11", end: "2019-01" },
  { id: "technical", start: "2010-03", end: "2012-12" },
];

/** Empresas e instituições da faixa "Onde já construí", da mais recente para a mais antiga. */
export const BUILT_AT = EXPERIENCE.map((job) => job.company);

/** Primeiro ano da régua da Trajetória. */
export const RULER_FIRST_YEAR = 2019;

const monthIndex = (ym: YearMonth) => {
  const [year, month] = ym.split("-").map(Number);
  return year * 12 + (month - 1);
};

/** Mês atual no fuso do site, para a régua (a página é estática: vale o mês do build). */
export function currentYearMonth(date = new Date(), timeZone = "America/Manaus"): YearMonth {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${Number(get("year"))}-${Number(get("month"))}` as YearMonth;
}

export interface RulerBar {
  /** Início da barra, em % da largura da régua. */
  left: number;
  /** Largura da barra, em %; inclui o mês final inteiro. */
  width: number;
}

/**
 * Posição de um período na régua, que vai de janeiro de `firstYear` até o fim do ano de `now`.
 * Um período sem fim vai até o fim do mês `now`.
 */
export function rulerBar(period: Period, now: YearMonth, firstYear = RULER_FIRST_YEAR): RulerBar {
  const origin = firstYear * 12;
  const span = (Number(now.split("-")[0]) + 1) * 12 - origin;
  const start = monthIndex(period.start) - origin;
  const end = monthIndex(period.end ?? now) + 1 - origin;
  const pct = (months: number) => Math.round((months / span) * 100 * 1000) / 1000;
  return { left: pct(start), width: pct(end - start) };
}

/** Anos marcados na régua, de `firstYear` até o ano de `now`. */
export function rulerYears(now: YearMonth, firstYear = RULER_FIRST_YEAR): number[] {
  const last = Number(now.split("-")[0]);
  return Array.from({ length: last - firstYear + 1 }, (_, i) => firstYear + i);
}
