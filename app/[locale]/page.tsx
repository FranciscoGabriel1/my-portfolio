// Phase 1 stub — sections will be added in Phase 4

export default function HomePage() {
  return (
    <main id="main-content">
      {/* Phase 4: <Hero /> */}
      {/* Phase 4: <About /> */}
      {/* Phase 4: <Projects /> */}
      {/* Phase 4: <Experience /> */}
      {/* Phase 4: <Contact /> */}

      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <div className="glass rounded-xl px-8 py-10">
          <h1 className="text-gradient font-display text-h1 font-bold">
            Francisco Marinho
          </h1>
          <p className="mt-2 text-text-secondary text-body-lg">
            Desenvolvedor Frontend Sênior
          </p>
          <p className="mt-6 text-text-muted text-caption">
            🚧 Portfólio em construção — Fase 1 concluída
          </p>
        </div>
      </div>
    </main>
  );
}
