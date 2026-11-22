import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { AdminPartnerRace, PartnerRace } from "@/types/api/partner-race.interface"

import { getMockDb, nextId, recordAudit } from "../mock-db"
import { invalidId, notFound, paramId, withAdmin } from "../mock-guards"
import { apiError, created, json, type MockContext, type MockRoute, noContent } from "../mock-http"
import { partnerRaceSchema, validate } from "../mock-schemas"
import { todayInFortaleza } from "../mock-time"

const ENTITY = "corrida_parceira"
/** `LIMITE_PUBLICO` do repositório do backend. */
const PUBLIC_LIMIT = 100

/** `presentCorridaParceiraPublica`: sem `ativo`, `ordem` e datas de controle. */
function toPublicPartnerRace(race: AdminPartnerRace): PartnerRace {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- campos só do admin
  const { ativo, ordem, criadoEm, atualizadoEm, ...rest } = race
  return { ...rest, distancias: [...rest.distancias] }
}

/** Id da rota: 422 se não numérico (o backend valida antes de buscar), 404 se não existe. */
function findRace(ctx: MockContext): AdminPartnerRace | Response {
  const id = paramId(ctx)
  if (id === null) return invalidId("id")
  return getMockDb().partnerRaces.find((race) => race.id === id) ?? notFound("Corrida parceira")
}

export const partnerRaceRoutes: MockRoute[] = [
  {
    // Ativas de hoje em diante, por ordem ↑, data ↑, id ↑ (`listarPublicas`).
    method: "GET",
    path: "/corridas-parceiras",
    handler: () => {
      const today = todayInFortaleza()
      const races = getMockDb()
        .partnerRaces.filter((race) => race.ativo && race.dataEvento >= today)
        .sort((a, b) => a.ordem - b.ordem || a.dataEvento.localeCompare(b.dataEvento) || a.id - b.id)
        .slice(0, PUBLIC_LIMIT)
      return json(200, races.map(toPublicPartnerRace))
    },
  },
  {
    // Todas, inclusive inativas e passadas: data ↓, id ↓.
    method: "GET",
    path: "/admin/corridas-parceiras",
    handler: withAdmin(() =>
      json(200, [...getMockDb().partnerRaces].sort((a, b) => b.dataEvento.localeCompare(a.dataEvento) || b.id - a.id)),
    ),
  },
  {
    method: "GET",
    path: "/admin/corridas-parceiras/:id",
    handler: withAdmin((ctx) => {
      const race = findRace(ctx)
      return race instanceof Response ? race : json(200, race)
    }),
  },
  {
    method: "POST",
    path: "/admin/corridas-parceiras",
    handler: withAdmin((ctx, admin) => {
      const input = validate(partnerRaceSchema, ctx.body)
      if (input instanceof Response) return input
      const db = getMockDb()
      const now = new Date().toISOString()
      const race: AdminPartnerRace = {
        ...input,
        id: nextId(db.partnerRaces),
        distancias: input.distancias ?? [],
        realizacao: input.realizacao ?? null,
        imagemCapaUrl: input.imagemCapaUrl ?? null,
        ativo: input.ativo ?? true,
        ordem: input.ordem ?? 0,
        criadoEm: now,
        atualizadoEm: now,
      }
      db.partnerRaces.push(race)
      recordAudit(admin, { acao: "criar", entidade: ENTITY, entidadeId: race.id })
      return created(race, `/admin/corridas-parceiras/${race.id}`)
    }),
  },
  {
    method: "PATCH",
    path: "/admin/corridas-parceiras/:id",
    handler: withAdmin((ctx, admin) => {
      const race = findRace(ctx)
      if (race instanceof Response) return race
      const changes = validate(partnerRaceSchema.partial(), ctx.body)
      if (changes instanceof Response) return changes
      // Só as chaves enviadas (`toAtualizacaoCorridaParceira`); `null` explícito limpa realizacao/imagem.
      const sent = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined))
      if (Object.keys(sent).length === 0) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "informe ao menos um campo para atualizar")
      }
      Object.assign(race, sent, { atualizadoEm: new Date().toISOString() })
      recordAudit(admin, { acao: "atualizar", entidade: ENTITY, entidadeId: race.id })
      return json(200, race)
    }),
  },
  {
    // Exclusão física (para ocultar, `PATCH { ativo: false }`).
    method: "DELETE",
    path: "/admin/corridas-parceiras/:id",
    handler: withAdmin((ctx, admin) => {
      const race = findRace(ctx)
      if (race instanceof Response) return race
      const db = getMockDb()
      db.partnerRaces = db.partnerRaces.filter((item) => item.id !== race.id)
      recordAudit(admin, { acao: "excluir", entidade: ENTITY, entidadeId: race.id })
      return noContent()
    }),
  },
]
