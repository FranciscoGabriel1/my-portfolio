import { describe, expect, it } from "vitest";
import { currentYearMonth, EDUCATION, EXPERIENCE, rulerBar, rulerYears } from "@/lib/content/career";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

// Régua de jan/2019 até o fim de 2026: 8 anos = 96 meses.
const NOW = "2026-11" as const;
const pct = (months: number) => (months / 96) * 100;

describe("régua da Trajetória", () => {
  it("põe a Atem de maio de 2022 até o fim de maio de 2025", () => {
    const atem = EXPERIENCE.find((j) => j.id === "atem")!;
    const bar = rulerBar(atem, NOW);
    expect(bar.left).toBeCloseTo(pct(3 * 12 + 4), 2); // maio/2022 = 40 meses após jan/2019
    expect(bar.width).toBeCloseTo(pct(37), 2); // mai/2022 a mai/2025, inclusive
  });

  it("estende o vínculo atual (HostGator) até o mês de referência", () => {
    const hostgator = EXPERIENCE.find((j) => j.id === "hostgator")!;
    const bar = rulerBar(hostgator, NOW);
    expect(bar.left).toBeCloseTo(pct(6 * 12 + 9), 2); // out/2025
    expect(bar.left + bar.width).toBeCloseTo(pct(7 * 12 + 11), 2); // fim de nov/2026
  });

  it("mantém todas as barras dentro da régua", () => {
    for (const job of EXPERIENCE) {
      const { left, width } = rulerBar(job, NOW);
      expect(left, job.id).toBeGreaterThanOrEqual(0);
      expect(left + width, job.id).toBeLessThanOrEqual(100);
      expect(width, job.id).toBeGreaterThan(0);
    }
  });

  it("marca um ano por coluna, de 2019 até o ano atual", () => {
    expect(rulerYears(NOW)).toEqual([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  });

  it("lê o mês atual no fuso de Manaus", () => {
    // 1º de dezembro, 02:00 UTC ainda é 30 de novembro em Manaus (UTC−4).
    expect(currentYearMonth(new Date("2026-12-01T02:00:00Z"))).toBe("2026-11");
  });
});

describe("texto da trajetória nos três idiomas", () => {
  it.each([
    ["pt", pt],
    ["en", en],
    ["es", es],
  ])("todo vínculo e toda formação têm texto em %s", (_locale, messages) => {
    const m = messages as unknown as {
      experience: { items: Record<string, Record<string, string>> };
      education: { items: Record<string, Record<string, string>> };
    };
    for (const { id } of EXPERIENCE) {
      for (const key of ["role", "location", "description"]) expect(m.experience.items[id]?.[key], `${id}.${key}`).toBeTruthy();
    }
    for (const { id } of EDUCATION) {
      for (const key of ["degree", "institution", "location"]) expect(m.education.items[id]?.[key], `${id}.${key}`).toBeTruthy();
    }
  });
});
