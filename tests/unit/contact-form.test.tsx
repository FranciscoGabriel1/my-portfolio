import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/sections/ContactForm";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

const MESSAGES = { pt, es } as unknown as Record<string, AbstractIntlMessages>;

function mount(locale: "pt" | "es" = "pt") {
  const user = userEvent.setup();
  render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="America/Manaus">
      <ContactForm />
    </NextIntlClientProvider>
  );
  return {
    user,
    subject: screen.getByRole("combobox", { name: locale === "pt" ? "Assunto" : "Asunto" }),
  };
}

// jsdom não implementa a rolagem até um elemento.
Element.prototype.scrollIntoView = vi.fn();
afterEach(cleanup);

describe("lista de assunto", () => {
  it("abre com seta para baixo, move com as setas e escolhe com Enter, mantendo o foco no botão", async () => {
    const { user, subject } = mount();
    subject.focus();
    expect(subject).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{ArrowDown}");
    expect(subject).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeVisible();

    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(subject).toHaveAttribute("aria-expanded", "false");
    expect(subject).toHaveTextContent("Parceria ou colaboração");
    expect(subject).toHaveFocus();
  });

  it("Esc fecha sem mudar a escolha", async () => {
    const { user, subject } = mount();
    subject.focus();
    await user.keyboard("{ArrowDown}{End}{Enter}");
    expect(subject).toHaveTextContent("Outro");

    subject.focus();
    await user.keyboard("{ArrowDown}{Home}{Escape}");
    expect(subject).toHaveAttribute("aria-expanded", "false");
    expect(subject).toHaveTextContent("Outro");
  });

  it("uma letra salta para a opção que começa com ela", async () => {
    const { user, subject } = mount();
    subject.focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("f");
    const active = subject.getAttribute("aria-activedescendant")!;
    expect(document.getElementById(active)).toHaveTextContent("Feedback sobre o portfólio");
  });

  it("clicar fora fecha a lista", async () => {
    const { user, subject } = mount();
    await user.click(subject);
    expect(subject).toHaveAttribute("aria-expanded", "true");
    await user.click(document.body);
    expect(subject).toHaveAttribute("aria-expanded", "false");
  });

  it("escolher Outro mostra o campo livre e leva o foco até ele", async () => {
    const { user, subject } = mount();
    await user.click(subject);
    await user.click(screen.getByRole("option", { name: "Outro" }));
    const other = screen.getByLabelText("Qual assunto?");
    await waitFor(() => expect(other).toHaveFocus());
  });
});

describe("formulário de contato", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("em espanhol, mostra os erros traduzidos, foca o primeiro e não envia", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { user } = mount("es");
    await user.type(screen.getByLabelText("Nombre"), "Ana Souza");
    await user.type(screen.getByLabelText("Correo"), "ana@");
    await user.click(screen.getByRole("button", { name: /Enviar/ }));

    expect(screen.getByLabelText("Correo")).toHaveFocus();
    expect(screen.getByText("Correo electrónico no válido")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Asunto" })).toHaveAccessibleDescription(
      "Elige un asunto"
    );
    expect(screen.getByText("El mensaje debe tener al menos 10 caracteres")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("o erro some enquanto a pessoa corrige o campo", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { user } = mount();
    await user.type(screen.getByLabelText("E-mail"), "ana@");
    await user.click(screen.getByRole("button", { name: /Enviar/ }));
    expect(screen.getByText("E-mail inválido")).toBeInTheDocument();

    await user.type(screen.getByLabelText("E-mail"), "exemplo.com");
    expect(screen.queryByText("E-mail inválido")).not.toBeInTheDocument();
  });

  it("Outro sem texto é recusado junto ao campo livre", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { user, subject } = mount();
    await user.click(subject);
    await user.click(screen.getByRole("option", { name: "Outro" }));
    await user.click(screen.getByRole("button", { name: /Enviar/ }));
    expect(screen.getByLabelText("Qual assunto?")).toHaveAccessibleDescription("Escreva o assunto");
  });

  it("envia o texto da opção escolhida como assunto, com as pontas aparadas", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);
    const { user, subject } = mount();
    await user.type(screen.getByLabelText("Nome"), "  Ana Souza ");
    await user.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
    await user.click(subject);
    await user.click(screen.getByRole("option", { name: "Proposta de projeto" }));
    await user.type(screen.getByLabelText("Mensagem"), "Olá! Tenho um projeto para conversar.");
    await user.click(screen.getByRole("button", { name: /Enviar/ }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toEqual({
      name: "Ana Souza",
      email: "ana@exemplo.com",
      subject: "Proposta de projeto",
      message: "Olá! Tenho um projeto para conversar.",
    });
    expect(await screen.findByText("Mensagem enviada!")).toBeInTheDocument();
  });
});
