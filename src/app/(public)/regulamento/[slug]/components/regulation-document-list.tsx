import { FileClock } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import type { PublicDocument } from "@/types/api/public-event-detail.interface"

import { RegulationDocumentItem } from "./regulation-document-item"

interface RegulationDocumentListProps {
  documents: PublicDocument[] | undefined
  eventSlug: string
}

export function RegulationDocumentList({ documents, eventSlug }: RegulationDocumentListProps) {
  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        icon={FileClock}
        title="Regulamento em breve"
        description="A organização está finalizando os documentos desta corrida. Volte em alguns dias."
        action={
          <Button asChild variant="outline">
            <Link href={`/corridas/${eventSlug}`}>Voltar para a corrida</Link>
          </Button>
        }
      />
    )
  }

  return (
    <ul aria-label="Documentos vigentes" className="flex flex-col gap-4">
      {documents.map((document) => (
        <RegulationDocumentItem key={document.id} document={document} />
      ))}
    </ul>
  )
}
