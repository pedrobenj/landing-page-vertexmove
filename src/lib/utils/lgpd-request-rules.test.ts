import { describe, expect, it } from "vitest"

import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

import { canAnonymizeLgpdRequest, getNextLgpdStatuses, isFinalLgpdStatus } from "./lgpd-request-rules"

describe("regras da solicitação LGPD (espelho do domínio do backend)", () => {
  it("concluída e recusada são finais", () => {
    expect(isFinalLgpdStatus(LGPD_REQUEST_STATUS.FULFILLED)).toBe(true)
    expect(isFinalLgpdStatus(LGPD_REQUEST_STATUS.REJECTED)).toBe(true)
    expect(isFinalLgpdStatus(LGPD_REQUEST_STATUS.OPEN)).toBe(false)
  })

  it("transições: aberta → em andamento/concluída/recusada; em andamento → concluída/recusada; finais → nenhuma", () => {
    expect(getNextLgpdStatuses(LGPD_REQUEST_STATUS.OPEN)).toEqual(["em_andamento", "concluida", "recusada"])
    expect(getNextLgpdStatuses(LGPD_REQUEST_STATUS.IN_PROGRESS)).toEqual(["concluida", "recusada"])
    expect(getNextLgpdStatuses(LGPD_REQUEST_STATUS.FULFILLED)).toEqual([])
  })

  it("anonimizar: só eliminação, não recusada e ainda não anonimizada", () => {
    const base = { tipo: LGPD_REQUEST_TYPE.DELETION, status: LGPD_REQUEST_STATUS.IN_PROGRESS, anonimizadaEm: null }
    expect(canAnonymizeLgpdRequest(base)).toBe(true)
    expect(canAnonymizeLgpdRequest({ ...base, status: LGPD_REQUEST_STATUS.FULFILLED })).toBe(true)
    expect(canAnonymizeLgpdRequest({ ...base, tipo: LGPD_REQUEST_TYPE.ACCESS })).toBe(false)
    expect(canAnonymizeLgpdRequest({ ...base, status: LGPD_REQUEST_STATUS.REJECTED })).toBe(false)
    expect(canAnonymizeLgpdRequest({ ...base, anonimizadaEm: "2026-11-23T13:00:00.000Z" })).toBe(false)
  })
})
