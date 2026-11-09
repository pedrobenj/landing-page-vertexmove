import "server-only"

import type { AuditEntry } from "@/types/api/audit-entry.interface"

import { createSeed } from "./mock-seed"
import { toFortalezaIso } from "./mock-time"
import type { MockAdmin, MockDb } from "./mock-types"

declare global {
  // Sobrevive ao HMR do `next dev` (o módulo é recarregado, o globalThis não).
  var __vertexMockDb: MockDb | undefined
}

export function getMockDb(): MockDb {
  globalThis.__vertexMockDb ??= createSeed()
  return globalThis.__vertexMockDb
}

/** Volta ao seed inicial (usado nos testes). */
export function resetMockDb(): MockDb {
  globalThis.__vertexMockDb = createSeed()
  return globalThis.__vertexMockDb
}

export function nextId(items: ReadonlyArray<{ id: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export function recordAudit(
  admin: MockAdmin,
  entry: Pick<AuditEntry, "acao" | "entidade"> & { entidadeId: number | string },
): void {
  const db = getMockDb()
  db.audit.push({
    id: nextId(db.audit),
    acao: entry.acao,
    entidade: entry.entidade,
    entidadeId: String(entry.entidadeId),
    adminNome: admin.nome,
    criadoEm: toFortalezaIso(new Date()),
  })
}
