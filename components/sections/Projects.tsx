"use client";

import { useTranslations, useMessages } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Github, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { FadeInView } from "@/components/animations/FadeInView";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  category: string;
  github: string | null;
  live: string | null;
  image: string;
}

interface Filter {
  key: FilterKey;
  label: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

type FilterKey = "all" | "frontend" | "backend" | "fullstack";

export const Projects = () => {
  const t = useTranslations("projects");
  const messages = useMessages() as unknown as { projects: { items: Project[] } };
  const projects = messages.projects.items;

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filters: Filter[] = [
    { key: "all",       label: t("filters.all") },
    { key: "frontend",  label: t("filters.frontend") },
    { key: "backend",   label: t("filters.backend") },
    { key: "fullstack", label: t("filters.fullstack") },
  ];

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  return (
    <section id="projects" aria-label={t("label")} className="relative py-28">
      <SectionDivider />

      <div className="container-content section-padding">

        {/* Section header */}
        <FadeInView className="mb-12 flex flex-col items-center text-center gap-3">
          <Badge variant="secondary">{t("label")}</Badge>
          <h2 className="font-display text-h1 font-bold text-text-primary">{t("title")}</h2>
          <p className="max-w-md text-body text-text-secondary">{t("subtitle")}</p>
        </FadeInView>

        {/* Filter tabs */}
        <FadeInView delay={0.1} className="mb-10 flex justify-center">
          <div
            role="tablist"
            aria-label={t("filter_aria_label")}
            className="glass flex items-center gap-1 rounded-lg p-1"
          >
            {filters.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeFilter === key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "relative rounded-md px-4 py-1.5 text-caption font-medium transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                  activeFilter === key ? "text-white" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {activeFilter === key && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-md bg-accent-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </FadeInView>

        {/* Projects grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const t = useTranslations("projects");

  return (
    <FadeInView delay={index * 0.07}>
      <Card hoverable className="group flex h-full flex-col overflow-hidden">

        {/* Image */}
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={project.image}
            alt={`Imagem do projeto ${project.title}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

          <div className="absolute left-3 top-3">
            <Badge
              variant="primary"
              size="sm"
              className="border-accent-primary/40 bg-black/60 text-white backdrop-blur-md"
            >
              {project.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-h3 font-bold text-text-primary">{project.title}</h3>

          <p className="flex-1 text-caption leading-relaxed text-text-secondary">
            {project.description}
          </p>

          {/* Stack badges */}
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="default" size="sm">{tech}</Badge>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 border-t border-border pt-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("github_label")} — ${project.title}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-caption font-medium",
                  "text-text-secondary hover:text-text-primary hover:bg-surface-elevated",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                )}
              >
                <Github className="h-3.5 w-3.5" aria-hidden />
                GitHub
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("live_label")} — ${project.title}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-caption font-medium",
                  "text-accent-primary hover:bg-accent-primary/10",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Live
              </a>
            )}
          </div>
        </div>
      </Card>
    </FadeInView>
  );
};
