import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { EVENT_ACTION } from "@/enums/event-action.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"

import { getMockDb, nextId, recordAudit } from "../mock-db"
import { notFound, paramId, withAdmin } from "../mock-guards"
import { apiError, created, json, type MockContext, type MockRoute, noContent } from "../mock-http"
import { toAdminEvent } from "../mock-mappers"
import { paginate } from "../mock-pagination"
import { adminEventSchema, validate, validatePatch } from "../mock-schemas"
import { toFortalezaIso } from "../mock-time"
import type { MockEvent } from "../mock-types"
import type { ApiKitPickup } from "@/types/api/api-event-detail.interface"

/** Colunas `retirada_kit_*` no corpo → chave em `retiradaKit` (formato de `retiradaDoEvento`). */
const PICKUP_FIELDS = {
  retiradaKitLocal: "local",
  retiradaKitEndereco: "endereco",
  retiradaKitInicio: "inicio",
  retiradaKitFim: "fim",
  retiradaKitInstrucoes: "instrucoes",
} as const satisfies Record<string, keyof ApiKitPickup>
const EMPTY_PICKUP: ApiKitPickup = { local: null, endereco: null, inicio: null, fim: null, instrucoes: null }

/**
 * Separa os campos de retirada do resto do corpo e aplica sobre a retirada atual (só as chaves enviadas;
 * `null`/`""` limpam). Sem nenhum dado, `null`. Fim antes do início → 422 (`ck_evento_retirada_kit`).
 */
function splitPickup(
  body: Record<string, unknown>,
  current: ApiKitPickup | null,
): { rest: Record<string, unknown>; pickup: ApiKitPickup | null } | Response {
  const rest: Record<string, unknown> = {}
  const pickup: ApiKitPickup = { ...(current ?? EMPTY_PICKUP) }
  for (const [key, value] of Object.entries(body)) {
    if (!(key in PICKUP_FIELDS)) {
      rest[key] = value
      continue
    }
    const field = PICKUP_FIELDS[key as keyof typeof PICKUP_FIELDS]
    const text = typeof value === "string" && value !== "" ? value : null
    pickup[field] = text !== null && (field === "inicio" || field === "fim") ? new Date(text).toISOString() : text
  }
  if (pickup.inicio && pickup.fim && Date.parse(pickup.fim) <= Date.parse(pickup.inicio)) {
    return apiError(422, API_ERROR_CODE.INVALID_DATA, "retiradaKitFim: deve ser depois do início da retirada")
  }
  return { rest, pickup: Object.values(pickup).some((value) => value !== null) ? pickup : null }
}

const { DRAFT, PUBLISHED, CLOSED, CANCELLED } = EVENT_STATUS

/** Transições válidas por ação: status de origem → status de destino. */
const TRANSITIONS: Record<EVENT_ACTION, { from: EVENT_STATUS[]; to: EVENT_STATUS; audit: string }> = {
  [EVENT_ACTION.PUBLISH]: { from: [DRAFT], to: PUBLISHED, audit: "evento.publicado" },
  [EVENT_ACTION.UNPUBLISH]: { from: [PUBLISHED], to: DRAFT, audit: "evento.despublicado" },
  [EVENT_ACTION.CLOSE]: { from: [PUBLISHED], to: CLOSED, audit: "evento.encerrado" },
  [EVENT_ACTION.CANCEL]: { from: [DRAFT, PUBLISHED], to: CANCELLED, audit: "evento.cancelado" },
  [EVENT_ACTION.RESTORE]: { from: [CANCELLED, CLOSED], to: DRAFT, audit: "evento.restaurado" },
}

function isEventAction(value: string): value is EVENT_ACTION {
  return (Object.values(EVENT_ACTION) as string[]).includes(value)
}

function isEventStatus(value: string): value is EVENT_STATUS {
  return (Object.values(EVENT_STATUS) as string[]).includes(value)
}

function findEvent(ctx: MockContext): MockEvent | undefined {
  const id = paramId(ctx)
  return getMockDb().events.find((event) => event.id === id && !event.deletedAt)
}

function slugTaken(slug: string, exceptId?: number): boolean {
  return getMockDb().events.some((event) => event.slug === slug && event.id !== exceptId)
}

const duplicateSlug = () => apiError(409, API_ERROR_CODE.DUPLICATE_SLUG, "Já existe um evento com este slug.")

export const adminEventRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/admin/eventos",
    handler: withAdmin((ctx) => {
      const status = ctx.query.get("status")
      if (status && !isEventStatus(status)) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Status inválido.")
      const events = getMockDb()
        .events.filter((event) => !event.deletedAt && (!status || event.status === status))
        .sort((a, b) => b.id - a.id)
      const page = paginate(events, ctx.query, (event) => event.id, toAdminEvent)
      return page instanceof Response ? page : json(200, page)
    }),
  },
  {
    method: "POST",
    path: "/admin/eventos",
    handler: withAdmin((ctx, admin) => {
      const input = validate(adminEventSchema, ctx.body)
      if (input instanceof Response) return input
      if (slugTaken(input.slug)) return duplicateSlug()

      const split = splitPickup(input, null)
      if (split instanceof Response) return split
      const db = getMockDb()
      const event = { ...split.rest, id: nextId(db.events), status: DRAFT, deletedAt: null, retiradaKit: split.pickup } as MockEvent
      db.events.push(event)
      recordAudit(admin, { acao: "evento.criado", entidade: "evento", entidadeId: event.id })
      return created(toAdminEvent(event), `/admin/eventos/${event.id}`)
    }),
  },
  {
    method: "GET",
    path: "/admin/eventos/:id",
    handler: withAdmin((ctx) => {
      const event = findEvent(ctx)
      return event ? json(200, toAdminEvent(event)) : notFound("Evento")
    }),
  },
  {
    method: "PATCH",
    path: "/admin/eventos/:id",
    handler: withAdmin((ctx, admin) => {
      const event = findEvent(ctx)
      if (!event) return notFound("Evento")
      const changes = validatePatch(adminEventSchema, ctx.body)
      if (changes instanceof Response) return changes
      if (typeof changes.slug === "string" && slugTaken(changes.slug, event.id)) return duplicateSlug()
      const split = splitPickup(changes, event.retiradaKit)
      if (split instanceof Response) return split

      Object.assign(event, split.rest, { retiradaKit: split.pickup })
      recordAudit(admin, { acao: "evento.atualizado", entidade: "evento", entidadeId: event.id })
      return json(200, toAdminEvent(event))
    }),
  },
  {
    method: "DELETE",
    path: "/admin/eventos/:id",
    handler: withAdmin((ctx, admin) => {
      const event = findEvent(ctx)
      if (!event) return notFound("Evento")
      event.deletedAt = toFortalezaIso(new Date())
      recordAudit(admin, { acao: "evento.excluido", entidade: "evento", entidadeId: event.id })
      return noContent()
    }),
  },
  {
    method: "POST",
    path: "/admin/eventos/:id/:acao",
    handler: withAdmin((ctx, admin) => {
      const action = ctx.params.acao
      if (!isEventAction(action)) return notFound("Ação")
      const event = findEvent(ctx)
      if (!event) return notFound("Evento")

      const transition = TRANSITIONS[action]
      if (!transition.from.includes(event.status)) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, `Não é possível ${action} um evento com status ${event.status}.`)
      }
      event.status = transition.to
      recordAudit(admin, { acao: transition.audit, entidade: "evento", entidadeId: event.id })
      return noContent()
    }),
  },
]
