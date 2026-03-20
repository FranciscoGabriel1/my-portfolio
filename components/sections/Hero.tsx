"use client";

import { useTranslations, useMessages } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowDown, Download, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/animations/FadeInView";
import { Particles } from "@/components/animations/Particles";

export function Hero() {
  const t = useTranslations("hero");
  const messages = useMessages();
  const roles = (messages as unknown as { hero: { roles: string[] } }).hero.roles;
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Animated background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Particles />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full bg-accent-primary blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-64 -right-64 h-[600px] w-[600px] rounded-full bg-accent-secondary blur-[120px]"
        />
      </div>

      <div className="container-content section-padding w-full py-16 pt-24 lg:py-24 lg:pt-36">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">

          {/* ── Left: text content ── */}
          <div className="flex flex-col gap-4 sm:gap-5">

            {/* Available badge — translated */}
            <FadeInView delay={0.05}>
              <Badge variant="success" className="w-fit gap-2">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-success" />
                </span>
                {t("available")}
              </Badge>
            </FadeInView>

            {/* Greeting */}
            <FadeInView delay={0.1}>
              <p className="text-body sm:text-body-lg text-text-secondary">
                {t("greeting")} 👋
              </p>
            </FadeInView>

            {/* Name */}
            <FadeInView delay={0.2}>
              <h1
                className="font-display font-black leading-none tracking-tight text-text-primary"
                style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)" }}
              >
                {t("name")}
              </h1>
            </FadeInView>

            {/* Rotating role — taller container, smaller font on mobile */}
            <FadeInView delay={0.25}>
              <div className="min-h-[2rem] overflow-hidden sm:min-h-[2.5rem]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={roleIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="text-lg font-semibold text-gradient sm:text-h3"
                  >
                    {roles[roleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </FadeInView>

            {/* Tagline */}
            <FadeInView delay={0.3}>
              <p className="max-w-md text-sm leading-relaxed text-text-secondary sm:text-body">
                {t("tagline")}
              </p>
            </FadeInView>

            {/* CTAs — full width on mobile */}
            <FadeInView delay={0.38} className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              <a href="#projects" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  {t("cta_projects")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </a>
              {/* TODO: copy curriculum PDF to /public/cv.pdf */}
              <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Download className="h-4 w-4" aria-hidden />
                  {t("cta_cv")}
                </Button>
              </a>
            </FadeInView>
          </div>

          {/* ── Right: profile card — hidden on small mobile, visible from sm ── */}
          <FadeInView delay={0.3} direction="left" className="hidden sm:flex justify-center lg:justify-end">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="glass w-full max-w-sm rounded-xl p-6"
            >
              {/* Avatar + name */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  <Image
                    src="/images/profile.jpeg"
                    alt="Francisco Marinho"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                    priority
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-surface-elevated bg-accent-success"
                  />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Francisco Marinho</p>
                  <p className="flex items-center gap-1 text-caption text-text-secondary">
                    <MapPin className="h-3 w-3" aria-hidden />
                    Manaus, Brasil
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  { value: "5+", label: "Anos" },
                  { value: "4", label: "Empresas" },
                  { value: "10+", label: "Projetos" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center rounded-md bg-surface p-3 text-center"
                  >
                    <span className="text-h3 font-bold text-accent-primary">{value}</span>
                    <span className="text-[0.6rem] uppercase tracking-widest text-text-muted">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tech stack badges */}
              <div className="flex flex-wrap gap-1.5">
                {["React", "Next.js", "TypeScript", "Redux", "Tailwind", "Node.js"].map((tech) => (
                  <Badge key={tech} variant="primary" size="sm">{tech}</Badge>
                ))}
              </div>
            </motion.div>
          </FadeInView>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
        <span className="text-caption text-text-muted">{t("scroll_hint")}</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <ArrowDown className="h-4 w-4 text-text-muted" />
        </motion.div>
      </div>
    </section>
  );
}
