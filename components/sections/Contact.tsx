"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Github, Linkedin, Mail, GraduationCap, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FadeInView } from "@/components/animations/FadeInView";
import { cn } from "@/lib/utils";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.03.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/FranciscoGabriel1", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/francisco-gabriel-software/", icon: Linkedin },
  { label: "Lattes", href: "http://lattes.cnpq.br/6111525331943224", icon: GraduationCap },
  { label: "Discord", href: "https://discord.gg/jDjgZUjamz", icon: DiscordIcon },
  { label: "Email", href: "mailto:franciscogabriel.dev@gmail.com", icon: Mail },
] as const;

type FormStatus = "idle" | "success" | "error";

export function Contact() {
  const t = useTranslations("contact");
  const tValidation = useTranslations("contact.validation");
  const [status, setStatus] = useState<FormStatus>("idle");

  const schema = z.object({
    name: z.string().min(2, tValidation("name_min")),
    email: z.string().email(tValidation("email_invalid")),
    subject: z.string().min(1, tValidation("subject_required")),
    message: z.string().min(10, tValidation("message_min")),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function onSubmit(data: FormData) {
    const mailto = `mailto:franciscogabriel.dev@gmail.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(`Nome: ${data.name}\nEmail: ${data.email}\n\n${data.message}`)}`;
    try {
      window.location.href = mailto;
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" aria-label={t("label")} className="relative py-28">
      {/* Top divider */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-accent-primary/5 blur-3xl" />
      </div>

      <div className="container-content section-padding">

        {/* Section header */}
        <FadeInView className="mb-16 flex flex-col items-center text-center gap-3">
          <Badge variant="primary">{t("label")}</Badge>
          <h2 className="font-display text-h1 font-bold text-text-primary">{t("title")}</h2>
          <p className="max-w-md text-body text-text-secondary">{t("subtitle")}</p>
        </FadeInView>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">

          {/* ── Left: social links ── */}
          <FadeInView direction="right" className="flex flex-col gap-6">
            <p className="text-caption font-semibold uppercase tracking-widest text-text-muted">
              Redes sociais
            </p>

            <div className="flex flex-col gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className={cn(
                    "glass flex items-center gap-4 rounded-lg px-5 py-4",
                    "text-text-secondary hover:text-text-primary",
                    "transition-all duration-200 hover:border-accent-primary/20 hover:shadow-glow-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                    <Icon className="h-4 w-4 text-accent-primary" />
                  </div>
                  <div>
                    <p className="text-body font-medium text-text-primary">{label}</p>
                    <p className="text-caption text-text-muted truncate max-w-[220px]">
                      {href.replace("mailto:", "").replace("https://", "").replace("http://", "")}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </FadeInView>

          {/* ── Right: contact form ── */}
          <FadeInView direction="left">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="glass flex flex-col gap-5 rounded-xl p-6"
              aria-label="Formulário de contato"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label={t("form.name_label")}
                  placeholder={t("form.name_placeholder")}
                  error={errors.name?.message}
                  autoComplete="name"
                  {...register("name")}
                />
                <Input
                  label={t("form.email_label")}
                  placeholder={t("form.email_placeholder")}
                  type="email"
                  error={errors.email?.message}
                  autoComplete="email"
                  {...register("email")}
                />
              </div>

              <Input
                label={t("form.subject_label")}
                placeholder={t("form.subject_placeholder")}
                error={errors.subject?.message}
                {...register("subject")}
              />

              <Textarea
                label={t("form.message_label")}
                placeholder={t("form.message_placeholder")}
                error={errors.message?.message}
                rows={5}
                {...register("message")}
              />

              {/* Status messages */}
              {status === "success" && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-md bg-accent-success/10 border border-accent-success/20 px-4 py-3 text-caption text-accent-success"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div>
                    <p className="font-medium">{t("form.success_title")}</p>
                    <p className="text-accent-success/70">{t("form.success_body")}</p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-md bg-accent-danger/10 border border-accent-danger/20 px-4 py-3 text-caption text-accent-danger"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div>
                    <p className="font-medium">{t("form.error_title")}</p>
                    <p className="text-accent-danger/70">{t("form.error_body")}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? t("form.submitting") : t("form.submit")}
              </Button>
            </form>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
