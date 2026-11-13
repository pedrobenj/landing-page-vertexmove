import { Footprints, HeartHandshake, Medal, ShieldCheck } from "lucide-react"

import type { ValueBadgeItem } from "@/types/value-badge.interface"

// TODO(cliente): confirmar os quatro selos com os textos institucionais do Vertex.
export const VALUE_BADGES: ValueBadgeItem[] = [
  { icon: Footprints, label: "Todos os ritmos" },
  { icon: ShieldCheck, label: "Percurso seguro" },
  { icon: Medal, label: "Chegada para comemorar" },
  { icon: HeartHandshake, label: "Gente que puxa pra cima" },
]
