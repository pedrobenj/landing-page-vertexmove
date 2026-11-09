import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { EventDocument } from "@/types/api/document.interface"
import type { Kit } from "@/types/api/kit.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

import { getMockDb, nextId, recordAudit } from "../mock-db"
import { notFound, paramId, requireAdmin } from "../mock-guards"
import { apiError, json, type MockContext, type MockRoute } from "../mock-http"
import { toDistance } from "../mock-mappers"
import {
  distanceSchema,
  documentSchema,
  kitSchema,
  priceTierSchema,
  shirtSizeSchema,
  validate,
  validatePatch,
} from "../mock-schemas"
import type { MockAdmin, MockDistance } from "../mock-types"

type Guarded<T> = (ctx: MockContext, admin: MockAdmin) => T

/** Exige Bearer antes de chamar o handler. */
function withAdmin(handler: Guarded<Response>): (ctx: MockContext) => Response {
  return (ctx) => {
    const admin = requireAdmin(ctx)
    return admin instanceof Response ? admin : handler(ctx, admin)
  }
}

function hasEvent(eventId: number | null): boolean {
  return getMockDb().events.some((event) => event.id === eventId && !event.deletedAt)
}

function created(body: unknown, location: string): Response {
  return json(201, body, { headers: new Headers({ Location: `/api/v1${location}` }) })
}

function byOrder<T extends { ordem: number; id: number }>(a: T, b: T): number {
  return a.ordem - b.ordem || a.id - b.id
}

export const adminCatalogRoutes: MockRoute[] = [
  // Distâncias
  {
    method: "GET",
    path: "/admin/eventos/:eventoId/distancias",
    handler: withAdmin((ctx) => {
      const eventId = paramId(ctx, "eventoId")
      if (!hasEvent(eventId)) return notFound("Evento")
      return json(200, getMockDb().distances.filter((item) => item.eventoId === eventId).sort(byOrder).map(toDistance))
    }),
  },
  {
    method: "POST",
    path: "/admin/eventos/:eventoId/distancias",
    handler: withAdmin((ctx, admin) => {
      const eventId = paramId(ctx, "eventoId")
      if (eventId === null || !hasEvent(eventId)) return notFound("Evento")
      const input = validate(distanceSchema, ctx.body)
      if (input instanceof Response) return input
      const db = getMockDb()
      const distance: MockDistance = { ...input, id: nextId(db.distances), eventoId: eventId, vagasOcupadasSeed: 0 }
      db.distances.push(distance)
      recordAudit(admin, { acao: "distancia.criada", entidade: "distancia", entidadeId: distance.id })
      return created(toDistance(distance), `/admin/distancias/${distance.id}`)
    }),
  },
  {
    method: "PATCH",
    path: "/admin/distancias/:id",
    handler: withAdmin((ctx, admin) => {
      const distance = getMockDb().distances.find((item) => item.id === paramId(ctx))
      if (!distance) return notFound("Distância")
      const changes = validatePatch(distanceSchema, ctx.body)
      if (changes instanceof Response) return changes
      Object.assign(distance, changes)
      recordAudit(admin, { acao: "distancia.atualizada", entidade: "distancia", entidadeId: distance.id })
      return json(200, toDistance(distance))
    }),
  },
  // Lotes
  {
    method: "GET",
    path: "/admin/distancias/:distanciaId/lotes",
    handler: withAdmin((ctx) => {
      const distanceId = paramId(ctx, "distanciaId")
      const db = getMockDb()
      if (!db.distances.some((item) => item.id === distanceId)) return notFound("Distância")
      return json(200, db.priceTiers.filter((item) => item.distanciaId === distanceId).sort(byOrder))
    }),
  },
  {
    method: "POST",
    path: "/admin/distancias/:distanciaId/lotes",
    handler: withAdmin((ctx, admin) => {
      const distanceId = paramId(ctx, "distanciaId")
      const db = getMockDb()
      if (distanceId === null || !db.distances.some((item) => item.id === distanceId)) return notFound("Distância")
      const input = validate(priceTierSchema, ctx.body)
      if (input instanceof Response) return input
      if (Date.parse(input.fimEm) <= Date.parse(input.inicioEm)) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "fimEm deve ser depois de inicioEm.")
      }
      const tier: PriceTier = { ...input, id: nextId(db.priceTiers), distanciaId: distanceId }
      db.priceTiers.push(tier)
      recordAudit(admin, { acao: "lote.criado", entidade: "lote", entidadeId: tier.id })
      return created(tier, `/admin/lotes/${tier.id}`)
    }),
  },
  {
    method: "PATCH",
    path: "/admin/lotes/:id",
    handler: withAdmin((ctx, admin) => {
      const tier = getMockDb().priceTiers.find((item) => item.id === paramId(ctx))
      if (!tier) return notFound("Lote")
      const changes = validatePatch(priceTierSchema, ctx.body)
      if (changes instanceof Response) return changes
      const next = { ...tier, ...changes }
      if (Date.parse(next.fimEm) <= Date.parse(next.inicioEm)) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "fimEm deve ser depois de inicioEm.")
      }
      Object.assign(tier, changes)
      recordAudit(admin, { acao: "lote.atualizado", entidade: "lote", entidadeId: tier.id })
      return json(200, tier)
    }),
  },
  // Kits
  {
    method: "GET",
    path: "/admin/eventos/:eventoId/kits",
    handler: withAdmin((ctx) => {
      const eventId = paramId(ctx, "eventoId")
      if (!hasEvent(eventId)) return notFound("Evento")
      return json(200, getMockDb().kits.filter((item) => item.eventoId === eventId))
    }),
  },
  {
    method: "POST",
    path: "/admin/eventos/:eventoId/kits",
    handler: withAdmin((ctx, admin) => {
      const eventId = paramId(ctx, "eventoId")
      if (eventId === null || !hasEvent(eventId)) return notFound("Evento")
      const input = validate(kitSchema, ctx.body)
      if (input instanceof Response) return input
      const db = getMockDb()
      const kit: Kit = { ...input, id: nextId(db.kits), eventoId: eventId }
      db.kits.push(kit)
      recordAudit(admin, { acao: "kit.criado", entidade: "kit", entidadeId: kit.id })
      return created(kit, `/admin/kits/${kit.id}`)
    }),
  },
  {
    method: "PATCH",
    path: "/admin/kits/:id",
    handler: withAdmin((ctx, admin) => {
      const kit = getMockDb().kits.find((item) => item.id === paramId(ctx))
      if (!kit) return notFound("Kit")
      const changes = validatePatch(kitSchema, ctx.body)
      if (changes instanceof Response) return changes
      Object.assign(kit, changes)
      recordAudit(admin, { acao: "kit.atualizado", entidade: "kit", entidadeId: kit.id })
      return json(200, kit)
    }),
  },
  // Tamanhos de camisa (catálogo global)
  {
    method: "GET",
    path: "/admin/tamanhos-camisa",
    handler: withAdmin(() => json(200, [...getMockDb().shirtSizes].sort(byOrder))),
  },
  {
    method: "POST",
    path: "/admin/tamanhos-camisa",
    handler: withAdmin((ctx, admin) => {
      const input = validate(shirtSizeSchema, ctx.body)
      if (input instanceof Response) return input
      const db = getMockDb()
      const size: ShirtSize = { ...input, id: nextId(db.shirtSizes) }
      db.shirtSizes.push(size)
      recordAudit(admin, { acao: "tamanho_camisa.criado", entidade: "tamanho_camisa", entidadeId: size.id })
      return created(size, `/admin/tamanhos-camisa/${size.id}`)
    }),
  },
  {
    method: "PATCH",
    path: "/admin/tamanhos-camisa/:id",
    handler: withAdmin((ctx, admin) => {
      const size = getMockDb().shirtSizes.find((item) => item.id === paramId(ctx))
      if (!size) return notFound("Tamanho de camisa")
      const changes = validatePatch(shirtSizeSchema, ctx.body)
      if (changes instanceof Response) return changes
      Object.assign(size, changes)
      recordAudit(admin, { acao: "tamanho_camisa.atualizado", entidade: "tamanho_camisa", entidadeId: size.id })
      return json(200, size)
    }),
  },
  // Documentos (versionados e imutáveis: sem PATCH)
  {
    method: "GET",
    path: "/admin/documentos",
    handler: withAdmin((ctx) => {
      const rawEventId = ctx.query.get("eventoId")
      const eventId = rawEventId === null ? null : Number(rawEventId)
      const documents = getMockDb().documents.filter((item) => eventId === null || item.eventoId === eventId)
      return json(200, documents.sort((a, b) => a.id - b.id))
    }),
  },
  {
    method: "POST",
    path: "/admin/documentos",
    handler: withAdmin((ctx, admin) => {
      const input = validate(documentSchema, ctx.body)
      if (input instanceof Response) return input
      if (!hasEvent(input.eventoId)) return notFound("Evento")
      const db = getMockDb()
      const document: EventDocument = { ...input, id: nextId(db.documents) }
      db.documents.push(document)
      recordAudit(admin, { acao: "documento.criado", entidade: "documento", entidadeId: document.id })
      return created(document, `/admin/documentos/${document.id}`)
    }),
  },
]
