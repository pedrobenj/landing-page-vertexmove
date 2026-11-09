import { ArrowLink } from "@/components/sections"
import type { PublicDocument } from "@/types/api/public-event-detail.interface"

import { EventDocumentItem } from "./event-document-item"

interface EventDocumentsProps {
  documents: PublicDocument[] | undefined
  slug: string
}

/** Regulamento e termo de responsabilidade vigentes, mais o link para a página do regulamento. */
export function EventDocuments({ documents, slug }: EventDocumentsProps) {
  return (
    <div className="flex flex-col gap-6">
      {documents && documents.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {documents.map((document) => (
            <EventDocumentItem key={document.id} document={document} />
          ))}
        </ul>
      )}
      <ArrowLink href={`/regulamento/${slug}`} className="text-brand-green-text">
        Ver regulamento completo
      </ArrowLink>
    </div>
  )
}
