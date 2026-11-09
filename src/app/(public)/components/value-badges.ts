import { HeartHandshake, Medal, Users, Footprints } from "lucide-react"

import type { ValueBadgeItem } from "@/types/value-badge.interface"

// TODO(cliente): confirmar os quatro selos com os textos institucionais do Vertex.
export const VALUE_BADGES: ValueBadgeItem[] = [
  { icon: HeartHandshake, label: "Ambiente acolhedor" },
  { icon: Footprints, label: "Para todos os níveis" },
  { icon: Medal, label: "Experiências marcantes" },
  { icon: Users, label: "Comunidade em movimento" },
]
