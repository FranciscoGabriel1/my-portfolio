/**
 * Recomendações publicadas no LinkedIn (públicas, "Todos os usuários do LinkedIn"), transcritas dos prints enviados
 * pelo dono em 2026-11-12. São citações: o texto fica exatamente como no original, sem tradução nem correção, e por
 * isso mora aqui, e não em `messages/`. O cargo é o início do título de cada pessoa no LinkedIn.
 * Ordem: da mais recente para a mais antiga; a primeira aparece em destaque.
 */

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  /** Mês e dia da recomendação no LinkedIn (AAAA-MM-DD). */
  date: string;
  relation: "same_team" | "different_teams";
  lang: "pt-BR" | "en";
  /** Parágrafos, como no original. */
  text: string[];
}

export const LINKEDIN_RECOMMENDATIONS_URL =
  "https://www.linkedin.com/in/francisco-gabriel-software/details/recommendations/";

export const RECOMMENDATIONS: readonly Recommendation[] = [
  {
    id: "nathan-heinzmann",
    name: "Nathan Heinzmann",
    role: "Frontend Engineer · Caju",
    date: "2026-03-09",
    relation: "same_team",
    lang: "en",
    text: [
      "Working with Francisco has been an incredibly rewarding experience. As a frontend engineer, he consistently demonstrates strong technical expertise, attention to detail, and a genuine commitment to building high-quality products.",
      "We had the opportunity to collaborate on several large projects from the ground up, and throughout these initiatives Francisco proved to be a reliable and thoughtful professional. From the early architecture and planning stages to the final delivery, he approaches challenges with a problem-solving mindset and a strong sense of ownership.",
      "Beyond his technical abilities, Francisco is also an excellent teammate. He communicates clearly, collaborates effectively, and contributes to a positive team environment. His dedication and professionalism make him someone I would gladly work with again and confidently recommend to any team looking for a skilled frontend engineer.",
    ],
  },
  {
    id: "rodrigo-mesquita",
    name: "Rodrigo Mesquita",
    role: "Backend Developer",
    date: "2025-05-24",
    relation: "same_team",
    lang: "pt-BR",
    text: [
      "Tive a oportunidade de trabalhar com o Francisco e posso dizer que ele é um excelente profissional. Sempre entregou suas atividades com qualidade, eficiência e atenção aos detalhes. Tem um bom domínio de front-end, especialmente com React, e suas entregas eram rápidas, funcionais e bem estruturadas.",
      "Além da parte técnica, o Francisco tem uma personalidade carismática e acessível, o que facilita muito a comunicação no time. Ele é alguém com quem é fácil discutir ideias, resolver problemas e colaborar no dia a dia.",
    ],
  },
  {
    id: "ruan-gato",
    name: "Ruan Gato",
    role: "Senior Fullstack Engineer · Solutions Architect",
    date: "2025-05-22",
    relation: "same_team",
    lang: "pt-BR",
    text: [
      "Francisco é muito atencioso, trabalhamos juntos e as demandas que lhe eram requisitadas eram muito bem atendidas, tem muito apreço pelo que faz e é um membro que colabora muito na equipe, trazendo inovação e melhorias continuas.",
    ],
  },
  {
    id: "milena-vasconcelos",
    name: "Milena Vasconcelos Moraes dos Santos",
    role: "Desenvolvedor Front-end",
    date: "2025-05-15",
    relation: "same_team",
    lang: "pt-BR",
    text: [
      "Tive a oportunidade de trabalhar com o Francisco Gabriel em projetos front-end utilizando ReactJS, Material UI e metodologias ágeis como Scrum e Kanban, com organização através do Jira e atenção à documentação. Francisco é um profissional extremamente competente, comprometido com a qualidade das entregas e sempre disposto a colaborar com a equipe. Além de seu forte conhecimento em front-end, ele está sempre se atualizando sobre novas tecnologias, incluindo back-end e Inteligência Artificial, o que demonstra sua dedicação contínua ao crescimento profissional. É um prazer trabalhar ao lado de alguém tão proativo, curioso e tecnicamente preparado. Recomendo fortemente!",
    ],
  },
  {
    id: "evaldo-cardoso",
    name: "Evaldo Cardoso",
    role: "Senior Software Engineer",
    date: "2025-05-15",
    relation: "same_team",
    lang: "pt-BR",
    text: [
      "Tive o privilégio de trabalhar com o Francisco e posso dizer com segurança que é alguém que faz a diferença por onde passa. Sempre comprometido(a) com entregas de qualidade, Francisco combina conhecimento técnico, visão estratégica e uma postura colaborativa que inspira o time.",
      "Durante nosso tempo juntos em três projetos, mostrou excelência na resolução de problemas, clareza na comunicação e uma habilidade rara de transformar ideias em resultados concretos. Sem dúvida, um profissional completo que eu recomendo com entusiasmo para qualquer desafio.",
    ],
  },
  {
    id: "pamela-otero",
    name: "Pamela Otéro",
    role: "Front-End Developer",
    date: "2023-12-13",
    relation: "same_team",
    lang: "pt-BR",
    text: [
      "Tive a oportunidade de colaborar diretamente com o Francisco na área de desenvolvimento Front-End, onde pude observar suas habilidades notáveis. Ele tem uma ótima comunicação e bastante carismático, contribuindo para um ambiente de trabalho harmonioso. Além disso, destaca-se por sua dedicação exemplar às atividades, sempre em busca de aprimoramento e exibindo uma notável criatividade. Francisco, sem dúvida, é uma valiosa adição a qualquer equipe de trabalho.",
    ],
  },
  {
    id: "walmizia-karinne",
    name: "Walmízia Karinne",
    role: "Bacharel em Química Industrial",
    date: "2022-01-30",
    relation: "different_teams",
    lang: "pt-BR",
    text: [
      "Francisco Gabriel é um engenheiro de software eficiente e profissional talentoso. Nos conhecemos através do Projeto Bolsa Trabalho da universidade UFAM/ICET, onde podemos trocar bastante conhecimento, mesmo ambos sendo de cursos diferentes. Fiquei impressionada com a sua capacidade de aprendizado e de se impor em ajudar nas ideias da equipe ou de impor suas próprias. Essa habilidade leva-se anos para ser desenvolvida, mas Francisco Gabriel faz isso de forma natural. O Gabriel é carismático, comunicativo e acessível a novas ideias, sempre procurando fazer amizades. Seja como membro, seja como líder, Francisco Gabriel conta com minha recomendação.",
    ],
  },
  {
    id: "maik-elamide",
    name: "Maik Elamide",
    role: "Engenheiro de Software · Bemol Digital",
    date: "2021-09-17",
    relation: "same_team",
    lang: "pt-BR",
    text: [
      "Francisco é um excelente profissional e posso destacar algumas características de seu perfil que é ser colaborativo, proativo e dedicado. Pessoa muito organizado, possui uma visão criativa do mundo e uma incrível capacidade de contar histórias. Como desenvolvedor busca excelência nos seus códigos, e se precisar de ajuda pode conta com ele, mesmo que ele não sabia sobre o assunto, busca aprender pra ajudar o colega, e isso observei durante a época da faculdade, inclusive aprendi muito com ele. Da última experiência de trabalhar com o Francisco foi de projeto concluído, no prazo e o cliente satisfeito.",
    ],
  },
  {
    id: "christian-reis",
    name: "Christian Reis",
    role: "Senior Software Engineer",
    date: "2021-08-29",
    relation: "same_team",
    lang: "pt-BR",
    text: [
      "Grande profissional, extremamente dedicado, busca sempre excelência em todas suas execuções, sempre disponível a aprender e compartilhar aquilo que aprendeu. Exímio escritor e brilhante na forma de se expressar, fazendo com que as mais distintas pessoas entendam a mensagem que ele quer passar, tanto escrevendo quanto falando. Fácil convivência e sempre disposto a ouvir e contribuir, bastante comunicativo, divertido, ideal pra proporcionar ambiente descontraído na equipe e fora dela.",
    ],
  },
];

/** Iniciais para o avatar: primeira e última palavra do nome. */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
