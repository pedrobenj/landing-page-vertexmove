import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"
import type { AdminLgpdRequestSummary } from "@/types/api/lgpd-request.interface"

/** `statusFinal` do backend. */
export function isFinalLgpdStatus(status: string): boolean {
  return status === LGPD_REQUEST_STATUS.FULFILLED || status === LGPD_REQUEST_STATUS.REJECTED
}

/** Próximos status aceitos (`transicaoPermitida`): só para montar o select; o backend confere (409). */
export function getNextLgpdStatuses(current: string): LGPD_REQUEST_STATUS[] {
  if (isFinalLgpdStatus(current)) return []
  return Object.values(LGPD_REQUEST_STATUS).filter(
    (status) => status !== current && (current === LGPD_REQUEST_STATUS.OPEN || status !== LGPD_REQUEST_STATUS.OPEN),
  )
}

/** O backend só anonimiza solicitação de eliminação que não foi recusada (e é idempotente). */
export function canAnonymizeLgpdRequest(request: Pick<AdminLgpdRequestSummary, "tipo" | "status" | "anonimizadaEm">): boolean {
  return request.tipo === LGPD_REQUEST_TYPE.DELETION && request.status !== LGPD_REQUEST_STATUS.REJECTED && request.anonimizadaEm === null
}
