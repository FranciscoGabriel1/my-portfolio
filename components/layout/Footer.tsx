import { getLocale, getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/i18n/routing";

const LATTES_URL = "http://lattes.cnpq.br/6111525331943224";

/** Rodapé de servidor: sem JavaScript no cliente. "Voltar ao topo" é um link de âncora. */
export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("footer");
  const tLanguage = await getTranslations("language");
  const tA11y = await getTranslations("accessibility");
  const year = new Date().getFullYear();

  return (
    <footer className="band-invert border-t border-line">
      <div className="container-site flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-10 font-mono text-[0.78rem] tracking-[0.06em] text-text-3">
        <p>
          © {year} Francisco Marinho · {t("location")}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a
            href={LATTES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center rounded-md text-text-2 underline-offset-4 hover:text-text hover:underline"
          >
            Lattes
            <span className="sr-only"> ({tA11y("open_link_new_tab")})</span>
          </a>
          <LanguageSwitcher current={locale} label={tLanguage("label")} />
          <a
            href="#hero"
            className="inline-flex min-h-10 items-center rounded-md text-text-2 underline-offset-4 hover:text-text hover:underline"
          >
            {t("back_to_top")} <span aria-hidden="true">&nbsp;↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
