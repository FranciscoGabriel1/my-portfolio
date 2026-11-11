"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buttonVariants } from "@/components/ui/Button";
import { AGENDA_URL } from "@/lib/contact";
import { CV_URL } from "@/lib/cv";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

const NAV_LINKS = [
  { key: "about", href: "#about" },
  { key: "projects", href: "#projects" },
  { key: "experience", href: "#experience" },
  { key: "contact", href: "#contact" },
] as const;

/** `logo`: a assinatura (components/layout/Signature.tsx), de servidor, para o desenho não entrar no JavaScript. */
export function Navbar({ logo }: { logo: ReactNode }) {
  const t = useTranslations("nav");
  const tLanguage = useTranslations("language");
  const tA11y = useTranslations("accessibility");
  const locale = useLocale() as Locale;
  const cvUrl = CV_URL[locale] ?? CV_URL.en;

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Menu de celular: foco no primeiro link ao abrir; Esc fecha e devolve o foco ao botão;
  // clicar fora fecha. Não prende o foco, porque o menu não cobre a página.
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const newTab = <span className="sr-only"> ({tA11y("open_link_new_tab")})</span>;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="container-site flex h-(--header-h) items-center gap-3 nav:gap-6">
        {/* Logomarca: assinatura desenhada (decorativa); o nome em texto fica para o leitor de tela. */}
        <a href="#hero" className="shrink-0 rounded-md py-1 text-text">
          {logo}
          <span className="sr-only">Francisco Marinho</span>
        </a>

        <nav aria-label={t("label")} className="ml-auto hidden nav:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <a
                  href={href}
                  className="rounded-md text-[0.95rem] text-text-2 transition-colors hover:text-text"
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 nav:ml-0 nav:gap-2">
          <LanguageSwitcher
            current={locale}
            label={tLanguage("label")}
            className="hidden nav:flex"
          />
          <ThemeToggle />
          {AGENDA_URL && (
            <a
              href={AGENDA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "primary", size: "sm" }),
                "hidden nav:inline-flex"
              )}
            >
              {t("schedule")}
              {newTab}
            </a>
          )}
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "hidden nav:inline-flex"
            )}
          >
            {t("download_cv")}
            {newTab}
          </a>
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "px-3 nav:hidden")}
          >
            {open ? (
              <X className="h-4 w-4" aria-hidden />
            ) : (
              <Menu className="h-4 w-4" aria-hidden />
            )}
            {t("menu")}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="border-t border-line bg-bg nav:hidden"
      >
        <div className="container-site flex flex-col gap-6 py-6">
          <nav aria-label={t("label")}>
            <ul className="flex flex-col">
              {NAV_LINKS.map(({ key, href }, index) => (
                <li key={key}>
                  <a
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md py-3 font-display text-2xl font-bold text-text"
                  >
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <LanguageSwitcher current={locale} label={tLanguage("label")} />
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              {t("download_cv")}
              {newTab}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
