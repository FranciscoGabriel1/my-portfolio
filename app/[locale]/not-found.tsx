import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-caption uppercase tracking-widest text-accent-primary">404</p>
      <h1 className="font-display text-h1 font-bold text-text-primary">
        Página não encontrada
      </h1>
      <p className="max-w-sm text-body text-text-secondary">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/pt"
        className="rounded-full bg-accent-primary px-6 py-2.5 text-body font-medium text-white transition hover:bg-accent-primary-hover"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
