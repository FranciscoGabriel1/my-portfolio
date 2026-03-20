"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-caption uppercase tracking-widest text-accent-primary">500</p>
      <h1 className="font-display text-h1 font-bold text-text-primary">
        Algo deu errado
      </h1>
      <p className="max-w-sm text-body text-text-secondary">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-accent-primary px-6 py-2.5 text-body font-medium text-white transition hover:bg-accent-primary-hover"
      >
        Tentar novamente
      </button>
    </main>
  );
}
