import "server-only"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { AdminEvent } from "@/types/api/admin-event.interface"
import type { ApiPublicDistance, ApiPublicEventDetail } from "@/types/api/api-event-detail.interface"
import type { Distance } from "@/types/api/distance.interface"
import type { EventAvailability } from "@/types/api/event-availability.interface"
import type { EventLocation, PublicEvent } from "@/types/api/event.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"
import type { PublicDocument } from "@/types/api/public-event-detail.interface"

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

/**
 * Lote vigente: o ativo de menor `ordem` cuja janela contém `now`. Fidelidade: o mock ignora
 * `quantidadeTotal` (não vira para o próximo lote quando um lote esgota); quem decide é o backend.
 */
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

/** Distância como o backend devolve no detalhe (`evento.presenter.ts`): lotes ativos, sem lote vigente nem esgotado. */
function toPublicDistance(distance: MockDistance): ApiPublicDistance {
  return {
    id: distance.id,
    nome: distance.nome,
    descricao: distance.descricao,
    distanciaMetros: distance.distanciaMetros,
    horarioLargada: distance.horarioLargada,
    percursoUrl: distance.percursoUrl,
    capacidadeTotal: distance.capacidadeTotal,
    ordem: distance.ordem,
    lotes: getMockDb()
      .priceTiers.filter((tier) => tier.distanciaId === distance.id && tier.ativo)
      .sort((a, b) => a.ordem - b.ordem)
      .map(({ id, nome, precoCentavos, inicioEm, fimEm, quantidadeTotal, ordem }) => ({
        id,
        nome,
        precoCentavos,
        inicioEm,
        fimEm,
        quantidadeTotal,
        ordem,
      })),
  }
}

function publicDistancesOf(event: MockEvent): MockDistance[] {
  return getMockDb()
    .distances.filter((distance) => distance.eventoId === event.id && distance.ativo)
    .sort((a, b) => a.ordem - b.ordem)
}

export function toPublicEventDetail(event: MockEvent): ApiPublicEventDetail {
  const db = getMockDb()
  return {
    ...toPublicEvent(event),
    galeriaUrl: event.galeriaUrl,
    distancias: publicDistancesOf(event).map(toPublicDistance),
    kits: db.kits
      .filter((kit) => kit.eventoId === event.id && kit.ativo)
      .map(({ id, nome, descricao, precoCentavos, fotos }) => ({ id, nome, descricao, precoCentavos, fotos })),
    tamanhosCamisa: db.shirtSizes.filter((size) => size.ativo).sort((a, b) => a.ordem - b.ordem),
    documentosVigentes: findCurrentDocuments(event.id),
  }
}

/** `GET /eventos/:slug/disponibilidade`: lote vigente e esgotado calculados na hora (sem cache). */
export function toEventAvailability(event: MockEvent, now: Date = new Date()): EventAvailability {
  return {
    eventoSlug: event.slug,
    calculadoEm: now.toISOString(), // como o presenter do backend
    distancias: publicDistancesOf(event).map((distance) => {
      const tier = findCurrentTier(distance.id, now)
      return {
        distanciaId: distance.id,
        esgotado: isSoldOut(distance),
        loteVigente: tier ? { id: tier.id, nome: tier.nome, precoCentavos: tier.precoCentavos } : null,
      }
    }),
  }
}

/** `"Ana Maria Silva" → "Ana S****"` (formato da consulta pública). */
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1] : ""
  return last ? `${first} ${last[0].toUpperCase()}****` : first
}
