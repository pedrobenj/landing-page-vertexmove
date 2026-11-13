import type { HowItWorksStep } from "@/types/how-it-works-step.interface"

/** A subida em seis degraus: do primeiro clique à chegada. */
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  { title: "Escolha seu topo", description: "Veja as provas abertas e o que cada uma oferece." },
  { title: "Defina a distância", description: "Do 3 km ao 10 km. Se houver, escolha também o kit e a camisa." },
  { title: "Garanta a vaga", description: "Preencha seus dados, aceite o regulamento e pague com Pix ou cartão." },
  { title: "Retire o kit", description: "Leve o código da inscrição no local e no horário informados." },
  { title: "Largue", description: "No dia da prova, é só subir no seu ritmo." },
  { title: "Chegue ao topo", description: "Cruzou a linha? O topo é seu. No kit com medalha, ela também." },
]

/**
 * Deslocamento de cada degrau no desktop (o 1º embaixo, o 6º no alto). Classes literais para o
 * Tailwind encontrá-las.
 */
export const STEP_RISE_CLASSES = ["lg:mt-40", "lg:mt-32", "lg:mt-24", "lg:mt-16", "lg:mt-8", "lg:mt-0"] as const
