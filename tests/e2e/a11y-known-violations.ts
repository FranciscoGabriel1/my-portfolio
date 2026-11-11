/**
 * Violações de acessibilidade que já existiam quando a rede de testes foi criada (2026-11-11).
 * Cada uma tem a change que vai removê-la. Esta lista só pode diminuir:
 * uma violação nova, fora daqui, reprova o CI.
 */
export const KNOWN_VIOLATIONS: Record<string, string> = {
  // Links "Live"/"GitHub" dos projetos com aria-label que não contém o texto visível (9 elementos).
  "label-content-name-mismatch": "conteudo-no-servidor-e-seo (aria-* traduzidos)",
};
