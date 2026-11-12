import { describe, expect, it } from "vitest";
import { RECOMMENDATIONS, initials } from "@/lib/content/recommendations";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

describe("recomendações do LinkedIn", () => {
  it("têm autor, cargo, data válida, idioma e texto em cada uma, sem ids repetidos", () => {
    expect(RECOMMENDATIONS.length).toBe(9);
    expect(new Set(RECOMMENDATIONS.map((r) => r.id)).size).toBe(RECOMMENDATIONS.length);
    for (const r of RECOMMENDATIONS) {
      expect(r.name && r.role, r.id).toBeTruthy();
      expect(Number.isNaN(Date.parse(r.date)), r.id).toBe(false);
      expect(["pt-BR", "en"]).toContain(r.lang);
      expect(r.text.length, r.id).toBeGreaterThan(0);
      expect(
        r.text.every((p) => p.trim().length > 20),
        r.id
      ).toBe(true);
    }
  });

  it("vêm da mais recente para a mais antiga (a primeira é o destaque)", () => {
    const dates = RECOMMENDATIONS.map((r) => r.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it.each([
    ["pt", pt],
    ["en", en],
    ["es", es],
  ])("têm os textos de interface em %s", (_locale, messages) => {
    const m = (messages as unknown as { recommendations: Record<string, string> }).recommendations;
    for (const key of [
      "label",
      "title",
      "subtitle",
      "original_note",
      "same_team",
      "different_teams",
      "linkedin",
    ]) {
      expect(m[key], key).toBeTruthy();
    }
  });

  it("usa a primeira e a última inicial do nome", () => {
    expect(initials("Milena Vasconcelos Moraes dos Santos")).toBe("MS");
    expect(initials("Nathan Heinzmann")).toBe("NH");
  });
});
