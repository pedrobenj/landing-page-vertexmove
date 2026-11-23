import type { EVENT_STATUS } from "@/enums/event-status.enum"

import type { ApiKitPickup } from "./api-event-detail.interface"
import type { EventLocation } from "./event.interface"

/** Campos editáveis de `POST /admin/eventos` e `PATCH /admin/eventos/:id` (`camposEventoSchema`, estrito). */
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
  /** Retirada do kit (`null` limpa). Instantes ISO com fuso; o fim depois do início. */
  retiradaKitLocal: string | null
  retiradaKitEndereco: string | null
  retiradaKitInicio: string | null
  retiradaKitFim: string | null
  retiradaKitInstrucoes: string | null
}

type LocationField = "localNome" | "endereco" | "complemento" | "bairro" | "cidade" | "uf" | "cep" | "latitude" | "longitude"
type KitPickupField = "retiradaKitLocal" | "retiradaKitEndereco" | "retiradaKitInicio" | "retiradaKitFim" | "retiradaKitInstrucoes"

/**
 * Evento das rotas admin. O detalhe (`presentEventoAdminDetalhado`) traz o local só em `localizacao` e a
 * retirada em `retiradaKit`; a lista (`presentEventoAdminResumo`) não traz horário, descrição nem local.
 */
export interface AdminEvent extends Omit<AdminEventInput, LocationField | KitPickupField | "descricao"> {
  id: number
  status: EVENT_STATUS
  descricao: string | null
  localizacao: EventLocation
  localizacaoResumo: string
  retiradaKit?: ApiKitPickup | null
}
