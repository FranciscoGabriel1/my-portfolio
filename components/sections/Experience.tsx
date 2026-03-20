"use client";

import { useTranslations, useMessages } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, MapPin, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/animations/FadeInView";
import { cn } from "@/lib/utils";

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  start: string;
  end: string | null;
  description: string;
  highlights: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  description: string;
}

function formatPeriod(start: string, end: string | null, present: string): string {
  const fmt = (d: string) => {
    const [year, month] = d.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  };
  return `${fmt(start)} — ${end ? fmt(end) : present}`;
}

function TimelineLine() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <div
      ref={ref}
      className="absolute left-4 top-0 hidden h-full w-0.5 overflow-hidden lg:left-1/2 lg:block lg:-translate-x-1/2"
    >
      <motion.div
        className="w-full bg-gradient-to-b from-accent-primary via-accent-secondary/60 to-transparent"
        initial={{ height: "0%" }}
        animate={isInView ? { height: "100%" } : { height: "0%" }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
    </div>
  );
}

export function Experience() {
  const t = useTranslations("experience");
  const tEdu = useTranslations("education");
  const messages = useMessages() as unknown as {
    experience: { items: ExperienceItem[] };
    education: { items: EducationItem[] };
  };

  const experiences = messages.experience.items;
  const educations = messages.education.items;

  return (
    <section id="experience" aria-label={t("label")} className="relative py-28">
      {/* Top divider */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container-content section-padding">

        {/* ── Experience ── */}
        <FadeInView className="mb-16 flex flex-col items-center text-center gap-3">
          <Badge variant="primary">{t("label")}</Badge>
          <h2 className="font-display text-h1 font-bold text-text-primary">{t("title")}</h2>
          <p className="max-w-md text-body text-text-secondary">{t("subtitle")}</p>
        </FadeInView>

        {/* Timeline */}
        <div className="relative mb-24">
          <TimelineLine />

          <div className="flex flex-col gap-10">
            {experiences.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <FadeInView
                  key={item.id}
                  delay={i * 0.08}
                  direction={isLeft ? "right" : "left"}
                  className={cn(
                    "relative flex flex-col",
                    "lg:flex-row lg:items-start",
                    isLeft ? "lg:justify-start" : "lg:flex-row-reverse"
                  )}
                >
                  {/* Card */}
                  <div className={cn("w-full lg:w-[46%]", isLeft ? "lg:pr-8" : "lg:pl-8")}>
                    <div className="glass rounded-lg p-5 transition-all duration-300 hover:border-accent-primary/20">
                      {/* Header */}
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-text-primary">{item.role}</h3>
                          <p className="text-body font-medium text-accent-primary">{item.company}</p>
                        </div>
                        <Badge
                          variant={item.end === null ? "success" : "default"}
                          size="sm"
                          className="shrink-0"
                        >
                          {item.end === null ? t("present") : ""}
                          {item.end !== null && item.type}
                        </Badge>
                      </div>

                      {/* Meta */}
                      <div className="mb-3 flex flex-wrap items-center gap-3 text-caption text-text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {item.location}
                        </span>
                        <span>
                          {formatPeriod(item.start, item.end, t("present"))}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mb-3 text-caption leading-relaxed text-text-secondary">
                        {item.description}
                      </p>

                      {/* Highlights */}
                      <ul className="flex flex-col gap-1.5" aria-label="Destaques">
                        {item.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2 text-caption text-text-muted">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-success" aria-hidden />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Timeline dot — desktop only */}
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-5 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent-primary bg-background lg:block"
                  />
                </FadeInView>
              );
            })}
          </div>
        </div>

        {/* ── Education ── */}
        <FadeInView className="mb-12 flex flex-col items-center text-center gap-3">
          <Badge variant="secondary">{tEdu("label")}</Badge>
          <h2 className="font-display text-h2 font-bold text-text-primary">{tEdu("title")}</h2>
        </FadeInView>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {educations.map((edu, i) => (
            <FadeInView key={edu.id} delay={i * 0.08}>
              <div className="glass flex h-full flex-col gap-3 rounded-lg p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-primary/10">
                  <GraduationCap className="h-4 w-4 text-accent-primary" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{edu.degree}</p>
                  <p className="text-caption text-accent-primary">{edu.institution}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2 text-caption text-text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {edu.location}
                  </span>
                  <span>{formatPeriod(edu.start, edu.end, "")}</span>
                </div>
                {edu.description && (
                  <p className="text-caption text-text-muted">{edu.description}</p>
                )}
              </div>
            </FadeInView>
          ))}
        </div>

      </div>
    </section>
  );
}
