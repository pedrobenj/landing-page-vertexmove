import "server-only"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { AdminEvent } from "@/types/api/admin-event.interface"
import type { Distance } from "@/types/api/distance.interface"
import type { EventLocation, PublicEvent } from "@/types/api/event.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"
import type {
  PublicDistance,
  PublicDocument,
  PublicEventDetail,
} from "@/types/api/public-event-detail.interface"

import { getMockDb } from "./mock-db"
import type { MockDistance, MockEvent } from "./mock-types"

const ACTIVE_REGISTRATION = new Set<string>([REGISTRATION_STATUS.PENDING, REGISTRATION_STATUS.CONFIRMED])

export function isActiveRegistrationStatus(status: string): boolean {
  return ACTIVE_REGISTRATION.has(status)
}

function toLocation(event: MockEvent): EventLocation {
  return {
    localNome: event.localNome,
    endereco: event.endereco,
    complemento: event.complemento,
    bairro: event.bairro,
    cidade: event.cidade,
    uf: event.uf,
    cep: event.cep,
    latitude: event.latitude,
    longitude: event.longitude,
  }
}

export function toPublicEvent(event: MockEvent): PublicEvent {
  return {
    slug: event.slug,
    nome: event.nome,
    descricao: event.descricao,
    dataEvento: event.dataEvento,
    horarioLargada: event.horarioLargada,
    localizacao: toLocation(event),
    imagemCapaUrl: event.imagemCapaUrl,
  }
}

export function toAdminEvent(event: MockEvent): AdminEvent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- campo interno do mock
  const { deletedAt, ...rest } = event
  return {
    ...rest,
    localizacao: toLocation(event),
    localizacaoResumo: `${event.localNome} — ${event.cidade}/${event.uf}`,
  }
}

export function toDistance(distance: MockDistance): Distance {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- campo interno do mock
  const { vagasOcupadasSeed, ...rest } = distance
  return rest
}

/** Lote ativo cujo período contém `now` (menor `ordem` em caso de sobreposição). */
export function findCurrentTier(distanceId: number, now: Date = new Date()): PriceTier | null {
  const time = now.getTime()
  const tiers = getMockDb()
    .priceTiers.filter(
      (tier) =>
        tier.distanciaId === distanceId &&
        tier.ativo &&
        Date.parse(tier.inicioEm) <= time &&
        time < Date.parse(tier.fimEm),
    )
    .sort((a, b) => a.ordem - b.ordem)
  return tiers[0] ?? null
}

export function isSoldOut(distance: MockDistance): boolean {
  const taken = getMockDb().registrations.filter(
    (registration) => registration.distanciaId === distance.id && isActiveRegistrationStatus(registration.status),
  ).length
  return distance.vagasOcupadasSeed + taken >= distance.capacidadeTotal
}

/** Documento vigente mais recente de cada tipo do evento. */
export function findCurrentDocuments(eventId: number, now: Date = new Date()): PublicDocument[] {
  const time = now.getTime()
  const documents = getMockDb().documents.filter(
    (document) => document.eventoId === eventId && Date.parse(document.vigenteEm) <= time,
  )
  return Object.values(DOCUMENT_TYPE).flatMap((tipo) => {
    const latest = documents
      .filter((document) => document.tipo === tipo)
      .sort((a, b) => Date.parse(b.vigenteEm) - Date.parse(a.vigenteEm))[0]
    return latest ? [{ id: latest.id, tipo, versao: latest.versao, titulo: latest.titulo, url: latest.url }] : []
  })
}

function toPublicDistance(distance: MockDistance): PublicDistance {
  const tier = findCurrentTier(distance.id)
  return {
    id: distance.id,
    nome: distance.nome,
    descricao: distance.descricao,
    distanciaMetros: distance.distanciaMetros,
    horarioLargada: distance.horarioLargada,
    percursoUrl: distance.percursoUrl,
    loteVigente: tier ? { nome: tier.nome, precoCentavos: tier.precoCentavos } : null,
    esgotado: isSoldOut(distance),
  }
}

export function toPublicEventDetail(event: MockEvent): PublicEventDetail {
  const db = getMockDb()
  return {
    ...toPublicEvent(event),
    galeriaUrl: event.galeriaUrl,
    distancias: db.distances
      .filter((distance) => distance.eventoId === event.id && distance.ativo)
      .sort((a, b) => a.ordem - b.ordem)
      .map(toPublicDistance),
    kits: db.kits
      .filter((kit) => kit.eventoId === event.id && kit.ativo)
      .map(({ id, nome, descricao, fotos }) => ({ id, nome, descricao, fotos })),
    tamanhosCamisa: db.shirtSizes.filter((size) => size.ativo).sort((a, b) => a.ordem - b.ordem),
    documentosVigentes: findCurrentDocuments(event.id),
  }
}

/** `"Ana Maria Silva" → "Ana S****"` (formato da consulta pública). */
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1] : ""
  return last ? `${first} ${last[0].toUpperCase()}****` : first
}
