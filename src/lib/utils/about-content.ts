import type { AboutSection } from "@/types/about-section.interface"

/**
 * Textos da página "Conheça o Vertex". Provisórios e sem fatos específicos.
 * TODO(cliente): história oficial (ano de fundação, fundadores, primeiros treinos/corridas) e missão.
 */
export const ABOUT_SECTIONS: readonly AboutSection[] = [
  {
    id: "nome",
    eyebrow: "Por que Vertex",
    title: "Vértice é o ponto mais alto",
    paragraphs: [
      "Vertex vem de vértice: o topo, o ponto onde as linhas se encontram. É o pico verde da nossa marca.",
      "Para nós, o topo não é um pódio distante. É a próxima meta de cada corredor, seja o primeiro 5 km ou o recorde nos 10.",
    ],
  },
  {
    id: "historia",
    eyebrow: "Nossa subida",
    title: "Uma prova de cada vez",
    paragraphs: [
      "O Vertex Grupo de Corrida nasceu em Fortaleza para levar gente para as ruas, um degrau por vez.",
      "Organizamos corridas de rua abertas a todos os ritmos, com percurso seguro, kit caprichado e chegada para comemorar.",
    ],
  },
  {
    id: "missao",
    eyebrow: "Onde queremos chegar",
    title: "Mais gente chegando ao seu topo",
    paragraphs: [
      "Queremos que cada prova seja o próximo degrau de alguém: quem nunca correu, quem voltou agora e quem já coleciona medalhas.",
      "Bem organizada do início ao fim, para você só pensar em subir.",
    ],
  },
]
