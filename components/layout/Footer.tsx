"use client";

import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { cn } from "@/lib/utils";

const TECH_STACK = ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"];

const BackToTop = () => {
  const t = useTranslations("footer");
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={t("back_to_top")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
};

export const Footer = () => {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-content section-padding py-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">

          {/* Left: brand + made with */}
          <div className="flex flex-col items-center gap-1 md:items-start">
            <div className="flex items-center gap-2 text-caption text-text-muted">
              <span>{t("made_with")}</span>
              <span aria-label="amor" role="img">♥</span>
              <span>{t("and")}</span>
              <div className="flex items-center gap-1.5">
                {TECH_STACK.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-sm bg-surface-elevated border border-border px-1.5 py-0.5 text-[0.65rem] font-medium text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-caption text-text-muted">
              © {currentYear} Francisco Marinho. {t("rights")}
            </p>
          </div>

          {/* Right: social links + back to top */}
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                aria-label={`${label} — abre em nova aba`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  "text-text-muted hover:text-text-primary hover:bg-surface-elevated",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                )}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            <div className="ml-2 border-l border-border pl-2">
              <BackToTop />
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
