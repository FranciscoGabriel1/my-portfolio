import { act, type ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/layout/Navbar";
import { Contact } from "@/components/sections/Contact";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

// As mensagens têm listas (ex.: hero.roles), que o tipo do next-intl não descreve; o app faz o mesmo cast no layout.
const MESSAGES = { pt, en, es } as unknown as Record<string, AbstractIntlMessages>;

// Só os componentes de cliente hidratam. Hero, Sobre, Projetos e Trajetória são de servidor (sem hidratação) e ficam fora.
function page(locale: string): ReactElement {
  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="America/Manaus">
      <Navbar />
      <main>
        <Contact />
      </main>
    </NextIntlClientProvider>
  );
}

describe("hidratação sem divergência", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it.each(["pt", "en", "es"])("o HTML do servidor hidrata sem avisos em %s", async (locale) => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

    // Renderização de servidor primeiro. Os avisos dela ("useLayoutEffect does nothing on the server")
    // vêm de rodar o renderizador de servidor dentro do jsdom e não indicam divergência.
    const serverSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    container.innerHTML = renderToString(page(locale));
    document.body.appendChild(container);
    serverSpy.mockRestore();

    // A partir daqui, qualquer erro no console durante a hidratação reprova o teste.
    const errors: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    });

    await act(async () => {
      hydrateRoot(container, page(locale), {
        onRecoverableError: (error) => errors.push(`recoverable: ${String(error)}`),
      });
    });

    expect(errors).toEqual([]);
  });
});
