import { Link } from "@/i18n/navigation";
import { LOCALE_NAMES, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  current: Locale;
  label: string;
  className?: string;
}

/**
 * Troca de idioma como três links (PT, EN, ES), sem menu suspenso: funciona sem JavaScript.
 * O nome acessível começa pelo texto visível ("EN — English"), e o idioma atual leva `aria-current`.
 */
export function LanguageSwitcher({ current, label, className }: LanguageSwitcherProps) {
  return (
    <ul aria-label={label} className={cn("flex items-center gap-1", className)}>
      {routing.locales.map((locale) => {
        const isCurrent = locale === current;
        return (
          <li key={locale}>
            <Link
              href="/"
              locale={locale}
              hrefLang={locale}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md px-2",
                "font-mono text-[0.78rem] tracking-[0.12em] uppercase transition-colors",
                isCurrent
                  ? "text-text underline decoration-accent decoration-2 underline-offset-[6px]"
                  : "text-text-2 hover:bg-surface hover:text-text"
              )}
            >
              {locale.toUpperCase()}
              <span className="sr-only" lang={locale}>
                {" — "}
                {LOCALE_NAMES[locale]}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
