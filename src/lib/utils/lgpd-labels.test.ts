import { describe, expect, it } from "vitest"

import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

import {
  getLgpdRequestStatusBadge,
  getLgpdRequestStatusLabel,
  getLgpdRequestTypeLabel,
  isLgpdStatusFilter,
  isLgpdTypeFilter,
  LGPD_REQUEST_TYPE_OPTIONS,
  LGPD_STATUS_FILTER_OPTIONS,
  LGPD_TYPE_FILTER_OPTIONS,
} from "./lgpd-labels"

describe("rótulos de LGPD", () => {
  it("tem rótulo para todo tipo e status", () => {
    for (const tipo of Object.values(LGPD_REQUEST_TYPE)) expect(getLgpdRequestTypeLabel(tipo)).not.toBe(tipo)
    for (const status of Object.values(LGPD_REQUEST_STATUS)) expect(getLgpdRequestStatusLabel(status)).not.toBe(status)
    expect(getLgpdRequestTypeLabel(LGPD_REQUEST_TYPE.DELETION)).toBe("Eliminação dos dados")
    expect(getLgpdRequestStatusLabel(LGPD_REQUEST_STATUS.IN_PROGRESS)).toBe("Em andamento")
  })

  it("valor desconhecido do backend cai no literal e no badge neutro", () => {
    expect(getLgpdRequestTypeLabel("novo_tipo")).toBe("novo_tipo")
    expect(getLgpdRequestStatusLabel("suspensa")).toBe("suspensa")
    expect(getLgpdRequestStatusBadge("suspensa")).toBe("bg-muted text-muted-foreground")
  })

  it("opções do formulário público e dos filtros do admin", () => {
    expect(LGPD_REQUEST_TYPE_OPTIONS).toHaveLength(6)
    expect(LGPD_STATUS_FILTER_OPTIONS[0]).toEqual({ value: "todos", label: "Todos" })
    expect(LGPD_TYPE_FILTER_OPTIONS[0]).toEqual({ value: "todos", label: "Todos" })
    expect(isLgpdStatusFilter("aberta")).toBe(true)
    expect(isLgpdStatusFilter("xyz")).toBe(false)
    expect(isLgpdTypeFilter("todos")).toBe(true)
    expect(isLgpdTypeFilter("acesso")).toBe(true)
  })
})
