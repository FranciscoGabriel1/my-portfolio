/**
 * Canais de contato e link de agendamento: endereços públicos, que não se traduzem.
 * O rótulo de cada canal fica em messages/, em `contact.channels.<id>`.
 */

/**
 * Página de agendamento do Google Agenda (ex.: https://calendar.app.google/...).
 * Vazio: "Agendar call" não aparece em lugar nenhum, para não haver link morto.
 */
export const AGENDA_URL = "https://calendar.app.google/gA8xnG6SVduVEJaJ9";

export interface Channel {
  id: "email" | "linkedin" | "github" | "lattes" | "discord";
  href: string;
  /** Endereço como aparece na página. */
  display: string;
}

export const CHANNELS: readonly Channel[] = [
  { id: "email", href: "mailto:franciscogabriel.dev@gmail.com", display: "franciscogabriel.dev@gmail.com" },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/in/francisco-gabriel-software/",
    display: "linkedin.com/in/francisco-gabriel-software",
  },
  { id: "github", href: "https://github.com/FranciscoGabriel1", display: "github.com/FranciscoGabriel1" },
  { id: "lattes", href: "http://lattes.cnpq.br/6111525331943224", display: "lattes.cnpq.br/6111525331943224" },
  { id: "discord", href: "https://discord.gg/jDjgZUjamz", display: "discord.gg/jDjgZUjamz" },
];

export const LATTES_URL = CHANNELS.find((c) => c.id === "lattes")!.href;
