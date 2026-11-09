import { ServerError } from "@/components/feedback"

// TODO(migracao): Task 9 — buscar as corridas abertas em listPublicEvents() (API VertexMove).
export function OpenEvents() {
  return <ServerError title="Não foi possível carregar as corridas" />
}
