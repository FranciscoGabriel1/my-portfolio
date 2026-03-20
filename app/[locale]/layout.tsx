import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Skip to main content — Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Pular para o conteúdo principal
        </a>

        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
