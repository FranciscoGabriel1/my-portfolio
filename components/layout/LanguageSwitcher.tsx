"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const localeConfig: Record<Locale, { countryCode: string; label: string }> = {
  pt: { countryCode: "br", label: "PT" },
  en: { countryCode: "us", label: "EN" },
  es: { countryCode: "es", label: "ES" },
};

function FlagImage({ countryCode, label }: { countryCode: string; label: string }) {
  return (
    <img
      src={`https://flagcdn.com/20x15/${countryCode}.png`}
      srcSet={`https://flagcdn.com/40x30/${countryCode}.png 2x`}
      width={20}
      height={15}
      alt={label}
      className="rounded-[2px] object-cover"
    />
  );
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = localeConfig[locale];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nextLocale: Locale) {
    setIsOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t("label")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-caption font-medium",
          "text-text-secondary hover:text-text-primary hover:bg-surface-elevated",
          "transition-colors duration-200 outline-none",
          "focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        <FlagImage countryCode={current.countryCode} label={current.label} />
        <span>{current.label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            aria-label={t("label")}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-36 rounded-md glass shadow-glass z-50 py-1 overflow-hidden"
          >
            {routing.locales.map((loc) => {
              const config = localeConfig[loc];
              const isActive = loc === locale;
              return (
                <li key={loc}>
                  <button
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(loc)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-caption",
                      "transition-colors duration-150",
                      isActive
                        ? "text-accent-primary font-medium"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                    )}
                  >
                    <FlagImage countryCode={config.countryCode} label={t(loc)} />
                    <span>{t(loc)}</span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
