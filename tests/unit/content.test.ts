import { describe, expect, it } from "vitest";
import { FEATURED_PROJECT_ID, PROJECTS } from "@/lib/content/projects";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

const MESSAGES = { pt, en, es } as const;

function strings(value: unknown, path = ""): Array<[string, string]> {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

describe("conteúdo estruturado em lib/content e texto em messages/", () => {
  it.each(Object.keys(MESSAGES))("todo projeto tem título, contexto e descrição em %s", (locale) => {
    const items = (MESSAGES[locale as keyof typeof MESSAGES].projects as { items: Record<string, Record<string, string>> }).items;
    for (const { id } of PROJECTS) {
      for (const key of ["title", "context", "description"]) {
        expect(items[id]?.[key], `${locale}: projects.items.${id}.${key}`).toBeTruthy();
      }
    }
  });

  it("o destaque existe na lista de projetos", () => {
    expect(PROJECTS.map((p) => p.id)).toContain(FEATURED_PROJECT_ID);
  });

  it.each(Object.keys(MESSAGES))("nenhuma mensagem em %s guarda caminho de arquivo ou URL", (locale) => {
    const offenders = strings(MESSAGES[locale as keyof typeof MESSAGES]).filter(
      ([path, text]) =>
        // Exceção temporária: os canais do Contato saem das mensagens na tarefa 5.2.
        !path.startsWith("contact.social.") && /https?:\/\/|\/images\/|\.(png|jpe?g|webp|svg)\b/i.test(text)
    );
    expect(offenders).toEqual([]);
  });
});
