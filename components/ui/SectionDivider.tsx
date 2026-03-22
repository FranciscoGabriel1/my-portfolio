interface SectionDividerProps {
  bottomGlow?: boolean;
}

export const SectionDivider = ({ bottomGlow = false }: SectionDividerProps) => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
    {bottomGlow && (
      <div className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-accent-primary/5 blur-3xl" />
    )}
  </div>
);
