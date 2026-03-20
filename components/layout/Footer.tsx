"use client";

import { useTranslations } from "next-intl";
import { Github, Linkedin, Mail, ArrowUp, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

function DiscordIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.03.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

type IconComponent = ComponentType<{ className?: string }>;

const SOCIAL_LINKS: { label: string; href: string; icon: IconComponent }[] = [
  {
    label: "GitHub",
    href: "https://github.com/FranciscoGabriel1",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/francisco-gabriel-software/",
    icon: Linkedin,
  },
  {
    label: "Lattes",
    href: "http://lattes.cnpq.br/6111525331943224",
    icon: GraduationCap,
  },
  {
    label: "Discord",
    href: "https://discord.gg/jDjgZUjamz",
    icon: DiscordIcon,
  },
  {
    label: "Email",
    href: "mailto:franciscogabriel.dev@gmail.com",
    icon: Mail,
  },
];

const TECH_STACK = ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"];

function BackToTop() {
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
}

export function Footer() {
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
}
