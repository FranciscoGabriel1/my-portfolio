/**
 * Dados estruturais dos projetos: endereços, imagens e stack (nomes próprios, que não se traduzem).
 * O texto de cada projeto fica em messages/<idioma>.json, em `projects.items.<id>`.
 * Assim, a tradução automática não alcança caminhos nem URLs.
 */

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  /** Endereço público do produto; `null` quando não há. */
  url: string | null;
  /** Repositório público; `null` quando não há. */
  github: string | null;
  image: ProjectImage;
  /** Stack curta, mostrada na página (3 a 5 itens). */
  stack: readonly string[];
}

/** Projeto em destaque na seção. Trocar aqui não muda layout nem textos. */
export const FEATURED_PROJECT_ID = "curriculoraiz";

/** Ordem de exibição: o destaque primeiro, depois a lista numerada. */
export const PROJECTS: readonly Project[] = [
  {
    id: "curriculoraiz",
    url: "https://curriculoraiz.com/",
    github: null,
    image: { src: "/images/projects/curriculoraiz.webp", width: 1440, height: 900 },
    stack: ["React", "TypeScript", "Node.js", "Prisma", "Puppeteer"],
  },
  {
    id: "hostgator-dashboard",
    url: "https://cliente.hostgator.com.br/inicio",
    github: null,
    image: { src: "/images/projects/dash_hg.png", width: 1910, height: 900 },
    stack: ["React", "Redux Saga", "Styled Components", "Jest"],
  },
  {
    id: "teksto",
    url: "https://teksto.com/#/",
    github: null,
    image: { src: "/images/projects/teksto.png", width: 1903, height: 845 },
    stack: ["React", "TypeScript", "ProseMirror"],
  },
  {
    id: "hostgator-cart",
    url: "https://cart.hostgator.com.br/?pid=437&billingCycle=triennially",
    github: null,
    image: { src: "/images/projects/carrinho_hg.png", width: 1910, height: 900 },
    stack: ["React", "Redux Saga", "Jest"],
  },
  {
    id: "mbx-academy",
    url: "https://newdashboard.mbx.academy/",
    github: null,
    image: { src: "/images/projects/lms_pecege.png", width: 1912, height: 907 },
    stack: ["React", "Zustand", "Tailwind CSS"],
  },
  {
    id: "atem-portal",
    url: "https://portal.grupoatem.com.br",
    github: null,
    image: { src: "/images/projects/portal_atem.webp", width: 1600, height: 733 },
    stack: ["React", "TypeScript", "Cognito"],
  },
  {
    id: "uprobotics",
    url: "https://uprobotics.com.br/",
    github: "https://github.com/FranciscoGabriel1/uprobotics",
    image: { src: "/images/projects/uprobotics.png", width: 1908, height: 963 },
    stack: ["React", "Blockly", "Webots"],
  },
  {
    id: "lab312",
    url: "https://lab312.vercel.app/",
    github: "https://github.com/FranciscoGabriel1/lab312",
    image: { src: "/images/projects/lab312.png", width: 1916, height: 979 },
    stack: ["HTML", "CSS", "Bootstrap"],
  },
];
