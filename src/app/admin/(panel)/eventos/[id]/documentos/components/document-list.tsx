import { ServerError } from "@/components/feedback"
import { groupDocumentsByType } from "@/lib/utils/document-types"
import { isApiError } from "@/server/api/api-error"
import { listDocuments } from "@/server/api/endpoints/documents"
import type { EventDocument } from "@/types/api/document.interface"

import { DocumentTypeSection } from "./document-type-section"

interface DocumentListProps {
  eventId: number
  canManage: boolean
}

/** Regulamento e termo, cada um com suas versões (o estado vazio fica em cada seção). */
export async function DocumentList({ eventId, canManage }: DocumentListProps) {
  let documents: EventDocument[]
  try {
    documents = await listDocuments(eventId)
  } catch (error) {
    // Só ApiError vira ServerError: o redirect do adminFetch (sessão expirada) sobe.
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar os documentos" />
  }

  return (
    <ul className="flex flex-col gap-4">
      {groupDocumentsByType(documents).map((group) => (
        <DocumentTypeSection key={group.tipo} eventId={eventId} group={group} canManage={canManage} />
      ))}
    </ul>
  )
}
