import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
});

export type Locale = (typeof routing.locales)[number];

/** Nome de cada idioma na própria língua: não se traduz (por isso não fica em messages/). */
export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

/** Fuso usado na formatação de datas no servidor e no cliente (evita ENVIRONMENT_FALLBACK e divergência). */
export const TIME_ZONE = "America/Manaus";
