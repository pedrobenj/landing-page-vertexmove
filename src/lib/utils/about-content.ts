import type { AboutSection } from "@/types/about-section.interface"

/**
 * Textos da página "Conheça o Vertex". Provisórios e sem fatos específicos.
 * TODO(cliente): história oficial (ano de fundação, fundadores, primeiros treinos/corridas) e missão.
 */
export const ABOUT_SECTIONS: readonly AboutSection[] = [
  {
    id: "historia",
    eyebrow: "Nossa história",
    title: "Correr junto é melhor",
    paragraphs: [
      "O Vertex Grupo de Corrida reúne, em Fortaleza, pessoas apaixonadas por correr e por estar em boa companhia.",
      "Somos uma comunidade que organiza corridas de rua abertas a todos, do primeiro quilômetro à próxima meta pessoal.",
    ],
  },
  {
    id: "missao",
    eyebrow: "Missão",
    title: "Levar mais gente para o topo",
    paragraphs: [
      "Queremos tornar a corrida de rua acessível, acolhedora e bem organizada para quem está começando e para quem já coleciona medalhas.",
      "Cada prova é pensada para que você chegue, corra no seu ritmo e saia com vontade de voltar.",
    ],
  },
]
