import "server-only"

import type { Transport } from "../transport"

// TODO(migracao): Task 4 — implementar as rotas do contrato em memória.
export const mockFetch: Transport = async () =>
  Response.json({ error: { codigo: "NAO_IMPLEMENTADO", mensagem: "Mock em construção" } }, { status: 501 })
