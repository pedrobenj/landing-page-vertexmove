import { describe, expect, it } from "vitest"

import { EVENT_ACTION } from "@/enums/event-action.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"

import { DELETE_EVENT_ACTION, getAvailableEventActions, isEventLifecycleAction } from "./event-lifecycle-actions"

const actionsOf = (status: string) => getAvailableEventActions(status).map((config) => config.action)

describe("getAvailableEventActions", () => {
  it("rascunho: publicar, cancelar e excluir", () => {
    expect(actionsOf(EVENT_STATUS.DRAFT)).toEqual([EVENT_ACTION.PUBLISH, EVENT_ACTION.CANCEL, DELETE_EVENT_ACTION])
  })

  it("publicado: despublicar, encerrar e cancelar (sem excluir)", () => {
    expect(actionsOf(EVENT_STATUS.PUBLISHED)).toEqual([EVENT_ACTION.UNPUBLISH, EVENT_ACTION.CLOSE, EVENT_ACTION.CANCEL])
  })

  it("encerrado e cancelado: restaurar e excluir", () => {
    expect(actionsOf(EVENT_STATUS.CLOSED)).toEqual([EVENT_ACTION.RESTORE, DELETE_EVENT_ACTION])
    expect(actionsOf(EVENT_STATUS.CANCELLED)).toEqual([EVENT_ACTION.RESTORE, DELETE_EVENT_ACTION])
  })

  it("arquivado: só excluir; status desconhecido: nada", () => {
    expect(actionsOf(EVENT_STATUS.ARCHIVED)).toEqual([DELETE_EVENT_ACTION])
    expect(actionsOf("suspenso")).toEqual([])
  })

  it("encerrar, cancelar e excluir pedem confirmação", () => {
    const confirmed = [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED]
      .flatMap((status) => getAvailableEventActions(status))
      .filter((config) => config.confirmation)
      .map((config) => config.action)
    expect(new Set(confirmed)).toEqual(new Set([EVENT_ACTION.CLOSE, EVENT_ACTION.CANCEL, DELETE_EVENT_ACTION]))
  })

  it("reconhece as ações válidas", () => {
    expect(isEventLifecycleAction("publicar")).toBe(true)
    expect(isEventLifecycleAction(DELETE_EVENT_ACTION)).toBe(true)
    expect(isEventLifecycleAction("arquivar")).toBe(false)
    expect(isEventLifecycleAction("toString")).toBe(false)
  })
})
