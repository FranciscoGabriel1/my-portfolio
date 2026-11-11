"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CheckCircle, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ContactFormData } from "@/lib/contact-validation";

// Zod e o resolvedor vêm sob demanda: o pedido começa no primeiro foco dentro do formulário,
// e a validação só roda no envio. Os campos já vêm prontos no HTML.
const loadValidation = () => import("@/lib/contact-validation");

type FormStatus = "idle" | "success" | "error";

/**
 * Formulário de contato (ilha de cliente). As regras e o envio são os mesmos de antes:
 * a segurança do servidor muda no bloco 5 de fundacao-stack-e-qualidade.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const tValidation = useTranslations("contact.validation");
  const [status, setStatus] = useState<FormStatus>("idle");

  const messages = {
    name_min: tValidation("name_min"),
    email_invalid: tValidation("email_invalid"),
    subject_required: tValidation("subject_required"),
    message_min: tValidation("message_min"),
  };

  const resolver: Resolver<ContactFormData> = async (values, context, options) => {
    const { createContactResolver } = await loadValidation();
    return createContactResolver(messages)(values, context, options);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver });

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
    // method/action evitam que, sem JavaScript, o navegador envie a mensagem na URL (GET).
    <form
      method="post"
      action="/api/contact"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={t("form_aria_label")}
      onFocus={() => void loadValidation()}
      className="flex flex-col gap-5"
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

      {status === "success" && (
        <div role="alert" className="flex items-start gap-3 rounded-[10px] border border-ok bg-bg px-4 py-3 text-ok">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{t("form.success_title")}</p>
            <p className="text-text-2">{t("form.success_body")}</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[10px] border border-danger bg-bg px-4 py-3 text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{t("form.error_title")}</p>
            <p className="text-text-2">{t("form.error_body")}</p>
          </div>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
        {!isSubmitting && <Send className="h-4 w-4" aria-hidden />}
        {isSubmitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
