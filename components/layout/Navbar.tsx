"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "about", href: "#about" },
  { label: "projects", href: "#projects" },
  { label: "experience", href: "#experience" },
  { label: "contact", href: "#contact" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function handleNavClick() {
    setMobileOpen(false);
  }

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isScrolled
            ? "glass border-b border-border"
            : "bg-transparent"
        )}
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <nav
          aria-label="Navegação principal"
          className="container-content section-padding flex h-16 items-center justify-between"
        >
          {/* Logo */}
          <a
            href="#main-content"
            aria-label="Francisco Marinho — Início"
            className="group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-primary text-white font-display font-bold text-caption transition-transform duration-200 group-hover:scale-110">
              FM
            </div>
            <span className="hidden text-body font-semibold text-text-primary sm:block">
              Francisco Marinho
            </span>
          </a>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-1 md:flex" role="list">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="rounded-md px-3 py-2 text-body text-text-secondary transition-colors duration-200 hover:text-text-primary hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                >
                  {t(label)}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop right actions */}
          <div className="hidden items-center gap-1 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" aria-label={t("download_cv")}>
              <Button variant="outline" size="sm">
                {t("download_cv")}
              </Button>
            </a>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileOpen ? t("close_menu") : t("open_menu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ opacity: 0, rotate: 45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -45 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-40 flex flex-col bg-background px-6 pt-24 pb-10 md:hidden"
          >
            <ul className="flex flex-col gap-2" role="list">
              {NAV_LINKS.map(({ label, href }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <a
                    href={href}
                    onClick={handleNavClick}
                    className="block rounded-md px-4 py-3 text-h3 font-semibold text-text-primary hover:bg-surface-elevated transition-colors"
                  >
                    {t(label)}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-3 border-t border-border pt-8">
              <LanguageSwitcher />
              <a
                href="/cv.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNavClick}
                className="flex-1"
              >
                <Button variant="primary" size="md" className="w-full">
                  {t("download_cv")}
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
