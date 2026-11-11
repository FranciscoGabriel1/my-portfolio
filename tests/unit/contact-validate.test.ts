import { describe, expect, it } from "vitest";
import { validateContact, validateField } from "@/lib/contact/validate";

const valid = {
  name: "Ana Souza",
  email: "ana@exemplo.com",
  subject: "Proposta de projeto",
  message: "Olá, tudo bem? Vamos conversar.",
};

describe("validateContact", () => {
  it("aceita um envio dentro das regras e apara as pontas", () => {
    const { data, errors } = validateContact({ ...valid, name: "  Ana Souza  " });
    expect(errors).toEqual({});
    expect(data.name).toBe("Ana Souza");
  });

  it("recusa cada campo fora das regras com o código certo", () => {
    const { errors } = validateContact({ name: "A", email: "ana@", subject: "   ", message: "oi" });
    expect(errors).toEqual({
      name: "name_min",
      email: "email_invalid",
      subject: "subject_required",
      message: "message_min",
    });
  });

  it("trata campos ausentes ou que não são texto como vazios", () => {
    const { errors } = validateContact({ name: 42, email: null });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "subject"]);
  });
});

describe("validateField", () => {
  it.each([
    ["name", "a".repeat(100), undefined],
    ["name", "a".repeat(101), "name_max"],
    ["subject", "a".repeat(150), undefined],
    ["subject", "a".repeat(151), "subject_max"],
    ["message", "a".repeat(10), undefined],
    ["message", "a".repeat(5001), "message_max"],
  ] as const)("%s com %#: %s", (field, value, code) => {
    expect(validateField(field, value)).toBe(code);
  });

  it.each(["ana@exemplo.com", "ana.souza+contato@sub.exemplo.com.br"])(
    "aceita o e-mail %s",
    (email) => {
      expect(validateField("email", email)).toBeUndefined();
    }
  );

  it.each([
    "ana",
    "ana@",
    "@exemplo.com",
    "ana@exemplo",
    "ana souza@exemplo.com",
    `${"a".repeat(250)}@ex.com`,
  ])("recusa o e-mail %s", (email) => expect(validateField("email", email)).toBe("email_invalid"));

  it("conta um emoji como um caractere", () => {
    expect(validateField("name", "😀😀")).toBeUndefined();
  });
});
