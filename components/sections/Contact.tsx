"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { FadeInView } from "@/components/animations/FadeInView";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { cn } from "@/lib/utils";

type FormStatus = "idle" | "success" | "error";

export const Contact = () => {
  const t = useTranslations("contact");
  const tValidation = useTranslations("contact.validation");
  const [status, setStatus] = useState<FormStatus>("idle");

  const schema = z.object({
    name:    z.string().min(2, tValidation("name_min")),
    email:   z.string().email(tValidation("email_invalid")),
    subject: z.string().min(1, tValidation("subject_required")),
    message: z.string().min(10, tValidation("message_min")),
  });

  type ContactFormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ContactFormData): Promise<void> => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" aria-label={t("label")} className="relative py-28">
      <SectionDivider bottomGlow />

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
              {t("social_title")}
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
              aria-label={t("form_aria_label")}
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
};
