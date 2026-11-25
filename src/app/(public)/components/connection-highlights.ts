import { CalendarDays, Footprints, Users } from "lucide-react"

import type { ConnectionHighlight } from "@/types/connection-highlight.interface"

// TODO(cliente): horário e ponto de encontro das Conexões.
export const CONNECTION_HIGHLIGHTS: ConnectionHighlight[] = [
  { icon: CalendarDays, label: "Quando", value: "Todo sábado" },
  { icon: Users, label: "Como", value: "Treino em grupo, com quem já corre e com quem está começando" },
  { icon: Footprints, label: "Pra quem", value: "Todos os ritmos, do primeiro passo ao pódio" },
]
