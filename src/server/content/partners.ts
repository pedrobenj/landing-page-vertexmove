import "server-only"

import { env } from "@/lib/env"
import type { Partner } from "@/types/partner.interface"

/** Parceiros reais do Vertex. Estático até haver endpoint (§16 do CLAUDE.md). */
// TODO(cliente): lista de parceiros/apoiadores com logos e links.
const PARTNERS: Partner[] = []

/** Dados de demonstração para o modo mock (nomes fictícios, sem logo). */
const DEMO_PARTNERS: Partner[] = [
  { nome: "Academia Movimento", logoUrl: null },
  { nome: "Fisio Ativa", logoUrl: null },
  { nome: "Nutri Leve", logoUrl: null },
  { nome: "Pé na Estrada Esportes", logoUrl: null },
  { nome: "Café da Orla", logoUrl: null },
  { nome: "Ótica Visão Clara", logoUrl: null },
]

/** Lista vazia → a seção de parceiros não renderiza. */
export function getPartners(): Partner[] {
  return env.USE_MOCK_API ? DEMO_PARTNERS : PARTNERS
}
