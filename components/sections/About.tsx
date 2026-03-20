"use client";

import { useTranslations, useMessages } from "next-intl";
import Image from "next/image";
import { MapPin, Code2, Layers, Server, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/animations/FadeInView";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  frontend: Code2,
  state_tools: Layers,
  backend_infra: Server,
  quality: ShieldCheck,
} as const;

type SkillCategory = keyof typeof CATEGORY_ICONS;

interface SkillGroup {
  label: string;
  items: string[];
}

export function About() {
  const t = useTranslations("about");
  const messages = useMessages() as unknown as {
    about: {
      skills: Record<SkillCategory, SkillGroup>;
    };
  };

  const skillCategories = Object.entries(messages.about.skills) as [
    SkillCategory,
    SkillGroup,
  ][];

  return (
    <section
      id="about"
      aria-label={t("label")}
      className="relative py-28 overflow-hidden"
    >
      {/* Subtle background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container-content section-padding">

        {/* Section header */}
        <FadeInView className="mb-16 flex flex-col items-center text-center">
          <Badge variant="primary" className="mb-4">{t("label")}</Badge>
          <h2 className="font-display text-h1 font-bold text-text-primary">
            {t("title")}
          </h2>
        </FadeInView>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">

          {/* ── Left: photo + bio ── */}
          <FadeInView direction="right" className="flex flex-col gap-8">

            {/* Photo + info card */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div className="h-36 w-36 overflow-hidden rounded-full border-2 border-accent-primary/20 ring-4 ring-accent-primary/10">
                  <Image
                    src="/images/profile.jpeg"
                    alt={t("label") + " — Francisco Marinho"}
                    width={144}
                    height={144}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                {/* Glow ring */}
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-accent-primary/20 blur-2xl"
                />
              </div>

              <div className="flex flex-col gap-3 text-center sm:text-left">
                <div>
                  <p className="font-display text-h3 font-bold text-text-primary">
                    Francisco Marinho
                  </p>
                  <p className="text-body text-text-secondary">
                    Desenvolvedor Frontend Sênior
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="default" size="sm" className="gap-1">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {t("location")}
                  </Badge>
                  <Badge variant="success" size="sm" className="gap-1.5">
                    <span className="relative flex h-1.5 w-1.5" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-success opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-success" />
                    </span>
                    {t("available")}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-4">
              <p className="text-body-lg leading-relaxed text-text-secondary">
                {t("bio_1")}
              </p>
              <p className="text-body leading-relaxed text-text-muted">
                {t("bio_2")}
              </p>
            </div>
          </FadeInView>

          {/* ── Right: skills ── */}
          <FadeInView direction="left" className="flex flex-col gap-5">
            <p className="text-caption font-semibold uppercase tracking-widest text-text-muted">
              {t("skills_title")}
            </p>

            <StaggerChildren className="flex flex-col gap-4" staggerDelay={0.07}>
              {skillCategories.map(([key, group]) => {
                const Icon = CATEGORY_ICONS[key];
                return (
                  <div
                    key={key}
                    className={cn(
                      "glass rounded-lg p-4",
                      "transition-all duration-300 hover:border-accent-primary/20"
                    )}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-primary/10">
                        <Icon className="h-3.5 w-3.5 text-accent-primary" aria-hidden />
                      </div>
                      <span className="text-caption font-semibold text-text-primary">
                        {group.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Badge key={item} variant="default" size="sm">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </StaggerChildren>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
