import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { MotionReady } from "@/components/motion/MotionReady";
import "@/app/globals.css";

/** Grupos de mensagens usados por componentes de cliente (Navbar, ThemeToggle, ContactForm). */
const CLIENT_NAMESPACES = ["nav", "language", "theme", "accessibility", "contact"] as const;

// Fontes servidas pelo próprio site (next/font), só o subconjunto latin, que cobre pt, en e es.
const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-heading",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const code = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-code",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Francisco Marinho — Desenvolvedor Frontend Sênior",
    template: "%s | Francisco Marinho",
  },
  description:
    "Portfólio de Francisco Marinho, Desenvolvedor Frontend Sênior especialista em React, Next.js e TypeScript. 5+ anos de experiência em arquiteturas modulares, design systems e performance web.",
  keywords: [
    "Francisco Marinho",
    "Desenvolvedor Frontend",
    "React",
    "Next.js",
    "TypeScript",
    "Frontend Sênior",
    "Portfólio",
    "Manaus",
  ],
  authors: [{ name: "Francisco Marinho", url: "https://franciscomarinho.dev" }],
  creator: "Francisco Marinho",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Francisco Marinho — Portfólio",
    title: "Francisco Marinho — Desenvolvedor Frontend Sênior",
    description:
      "5+ anos em React, Next.js e TypeScript. Especialista em design systems, performance e acessibilidade.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Francisco Marinho — Desenvolvedor Frontend Sênior",
    description: "5+ anos em React, Next.js e TypeScript.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Permite gerar as páginas de cada idioma no build (renderização estática com next-intl).
  setRequestLocale(locale);
  const messages = await getMessages();
  // Só as ilhas de cliente (cabeçalho e formulário) usam mensagens no navegador: o resto não vai no HTML.
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((key) => key in messages).map((key) => [key, messages[key]])
  );
  const tA11y = await getTranslations("accessibility");

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} ${code.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-on-accent"
        >
          {tA11y("skip_to_content")}
        </a>
        <MotionReady />

        <Providers locale={locale} messages={clientMessages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
