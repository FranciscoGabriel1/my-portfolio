import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Regras do formulário de contato. O formulário carrega este módulo sob demanda (Zod é a maior
 * parte do peso do formulário), e o bloco 5 de fundacao-stack-e-qualidade passa a usá-lo também
 * no servidor.
 */

export interface ContactValidationMessages {
  name_min: string;
  email_invalid: string;
  subject_required: string;
  message_min: string;
}

export function createContactSchema(m: ContactValidationMessages) {
  return z.object({
    name: z.string().min(2, m.name_min),
    email: z.string().email(m.email_invalid),
    subject: z.string().min(1, m.subject_required),
    message: z.string().min(10, m.message_min),
  });
}

export type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;

export const createContactResolver = (m: ContactValidationMessages) => zodResolver(createContactSchema(m));
