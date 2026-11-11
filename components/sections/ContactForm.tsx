"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Briefcase, Bug, CheckCircle, Handshake, Lightbulb, MessageSquare, PenLine, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SubjectSelect, type SelectOption } from "@/components/ui/SubjectSelect";
import { Textarea } from "@/components/ui/Textarea";
import { CONTACT_LIMITS, validateField, type ContactErrorCode } from "@/lib/contact/validate";

type FormStatus = "idle" | "success" | "error";
type TextField = "name" | "email" | "message" | "subjectOther";
type FieldErrors = Partial<Record<TextField | "subject", ContactErrorCode | "subject_other_required">>;

const SUBJECTS = [
  { id: "job", icon: Briefcase },
  { id: "project", icon: Lightbulb },
  { id: "partnership", icon: Handshake },
  { id: "feedback", icon: MessageSquare },
  { id: "bug", icon: Bug },
  { id: "other", icon: PenLine },
] as const;
type SubjectId = (typeof SUBJECTS)[number]["id"];

const EMPTY = { name: "", email: "", message: "", subjectOther: "" };
/** Ordem do foco ao recusar um envio: o primeiro campo com erro, na ordem da tela. */
const ORDER = ["name", "email", "subject", "subjectOther", "message"] as const;

/**
 * Formulário de contato (ilha de cliente), sem biblioteca de formulário: as regras vêm de lib/contact/validate.ts,
 * as mesmas que o servidor vai usar (bloco 5 de fundacao-stack-e-qualidade). Valida no envio; depois de um envio
 * recusado, cada campo é revalidado enquanto a pessoa corrige.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const tValidation = useTranslations("contact.validation");
  const [values, setValues] = useState(EMPTY);
  const [subject, setSubject] = useState<SubjectId | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLButtonElement>(null);
  const subjectOtherRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const options: SelectOption[] = SUBJECTS.map(({ id, icon }) => ({ id, icon, label: t(`form.subject_options.${id}`) }));

  function check(field: TextField | "subject", v = values, s = subject): FieldErrors[typeof field] {
    if (field === "subject") return s ? undefined : "subject_required";
    if (field === "subjectOther") {
      if (s !== "other") return undefined;
      const code = validateField("subject", v.subjectOther);
      return code === "subject_required" ? "subject_other_required" : code;
    }
    return validateField(field, v[field]);
  }

  const update = (field: TextField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (checked) setErrors((prev) => ({ ...prev, [field]: check(field, next) }));
  };

  function chooseSubject(id: string) {
    const next = id as SubjectId;
    setSubject(next);
    if (checked) setErrors((prev) => ({ ...prev, subject: undefined, subjectOther: check("subjectOther", values, next) }));
    // "Outro" abre o campo livre e leva o foco até ele, depois que ele aparecer.
    if (next === "other") requestAnimationFrame(() => subjectOtherRef.current?.focus());
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const found: FieldErrors = {};
    for (const field of ORDER) {
      const code = check(field);
      if (code) found[field] = code;
    }
    setChecked(true);
    setErrors(found);
    const first = ORDER.find((f) => found[f]);
    if (first) {
      const target = { name: nameRef, email: emailRef, subject: subjectRef, subjectOther: subjectOtherRef, message: messageRef }[first];
      target.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: subject === "other" ? values.subjectOther.trim() : t(`form.subject_options.${subject}`),
          message: values.message.trim(),
        }),
      });
      if (!response.ok) throw new Error();
      setStatus("success");
      setValues(EMPTY);
      setSubject("");
      setChecked(false);
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  const message = (field: keyof FieldErrors) => (errors[field] ? tValidation(errors[field]) : undefined);

  return (
    // method/action evitam que, sem JavaScript, o navegador envie a mensagem na URL (GET).
    <form
      method="post"
      action="/api/contact"
      onSubmit={onSubmit}
      noValidate
      aria-label={t("form_aria_label")}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          ref={nameRef}
          id="contact-name"
          name="name"
          label={t("form.name_label")}
          placeholder={t("form.name_placeholder")}
          autoComplete="name"
          maxLength={CONTACT_LIMITS.name.max}
          value={values.name}
          onChange={update("name")}
          error={message("name")}
        />
        <Input
          ref={emailRef}
          id="contact-email"
          name="email"
          type="email"
          label={t("form.email_label")}
          placeholder={t("form.email_placeholder")}
          autoComplete="email"
          maxLength={CONTACT_LIMITS.email.max}
          value={values.email}
          onChange={update("email")}
          error={message("email")}
        />
      </div>

      <SubjectSelect
        ref={subjectRef}
        label={t("form.subject_label")}
        placeholder={t("form.subject_placeholder")}
        options={options}
        value={subject}
        onChange={chooseSubject}
        error={message("subject")}
      />

      {subject === "other" && (
        <Input
          ref={subjectOtherRef}
          id="contact-subject-other"
          name="subject"
          label={t("form.subject_other_label")}
          placeholder={t("form.subject_other_placeholder")}
          maxLength={CONTACT_LIMITS.subject.max}
          value={values.subjectOther}
          onChange={update("subjectOther")}
          error={message("subjectOther")}
        />
      )}

      <Textarea
        ref={messageRef}
        id="contact-message"
        name="message"
        label={t("form.message_label")}
        placeholder={t("form.message_placeholder")}
        rows={5}
        maxLength={CONTACT_LIMITS.message.max}
        value={values.message}
        onChange={update("message")}
        error={message("message")}
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

      <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
        {!submitting && <Send className="h-4 w-4" aria-hidden />}
        {submitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
