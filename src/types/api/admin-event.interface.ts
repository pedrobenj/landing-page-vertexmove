import type { EVENT_STATUS } from "@/enums/event-status.enum"

import type { EventLocation } from "./event.interface"

/** Campos editáveis de `POST /admin/eventos` e `PATCH /admin/eventos/:id`. */
export interface AdminEventInput {
  slug: string
  nome: string
  descricao: string
  dataEvento: string // YYYY-MM-DD
  horarioLargada: string // HH:mm
  localNome: string
  endereco: string | null
  complemento: string | null
  bairro: string | null
  cidade: string
  uf: string
  cep: string | null // só dígitos
  latitude: number | null
  longitude: number | null
  imagemCapaUrl: string | null
  galeriaUrl: string | null
}

/** Evento como devolvido pelas rotas admin. */
export interface AdminEvent extends AdminEventInput {
  id: number
  status: EVENT_STATUS
  localizacao: EventLocation
  localizacaoResumo: string
}
