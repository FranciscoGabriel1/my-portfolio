/**
 * Regras do formulário de contato (spec formulario-de-contato), sem biblioteca. Função pura: roda no
 * navegador e no servidor (bloco 5 de fundacao-stack-e-qualidade) e devolve códigos de erro, não textos;
 * quem mostra os erros traduz os códigos com `messages/`.
 */

export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { min: 1, max: 150 },
  message: { min: 10, max: 5000 },
} as const;

export type ContactField = keyof typeof CONTACT_LIMITS;
export const CONTACT_FIELDS = Object.keys(CONTACT_LIMITS) as ContactField[];

export type ContactErrorCode =
  | "name_min"
  | "name_max"
  | "email_invalid"
  | "subject_required"
  | "subject_max"
  | "message_min"
  | "message_max";

export type ContactData = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

/** A mesma regra do `<input type="email">` (HTML Living Standard), sem aceitar o domínio sem ponto. */
const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Conta caracteres como a pessoa vê (um emoji é um), não unidades UTF-16. */
const length = (s: string) => [...s].length;

export function validateField(field: ContactField, raw: unknown): ContactErrorCode | undefined {
  const value = typeof raw === "string" ? raw.trim() : "";
  switch (field) {
    case "name":
      if (length(value) < CONTACT_LIMITS.name.min) return "name_min";
      if (length(value) > CONTACT_LIMITS.name.max) return "name_max";
      return;
    case "email":
      if (value.length > CONTACT_LIMITS.email.max || !EMAIL.test(value)) return "email_invalid";
      return;
    case "subject":
      if (length(value) < CONTACT_LIMITS.subject.min) return "subject_required";
      if (length(value) > CONTACT_LIMITS.subject.max) return "subject_max";
      return;
    case "message":
      if (length(value) < CONTACT_LIMITS.message.min) return "message_min";
      if (length(value) > CONTACT_LIMITS.message.max) return "message_max";
      return;
  }
}

/** Valida tudo de uma vez. `data` vem com as pontas aparadas; é o que deve ser enviado ou entregue. */
export function validateContact(input: Partial<Record<ContactField, unknown>>): {
  data: ContactData;
  errors: ContactErrors;
} {
  const data = {} as ContactData;
  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const raw = input[field];
    data[field] = typeof raw === "string" ? raw.trim() : "";
    const code = validateField(field, raw);
    if (code) errors[field] = code;
  }
  return { data, errors };
}
