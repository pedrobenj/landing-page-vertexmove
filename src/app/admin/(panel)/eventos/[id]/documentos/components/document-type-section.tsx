import { getEmptyDocumentForm } from "@/lib/utils/document-form-values"
import type { DocumentTypeGroup } from "@/lib/utils/document-types"

import { DocumentFormDialog } from "./document-form-dialog"
import { DocumentRow } from "./document-row"

interface DocumentTypeSectionProps {
  eventId: number
  group: DocumentTypeGroup
  canManage: boolean
}

export function DocumentTypeSection({ eventId, group, canManage }: DocumentTypeSectionProps) {
  const headingId = `documents-${group.tipo}`
  return (
    <li>
      <section aria-labelledby={headingId} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 id={headingId} className="font-heading text-lg font-extrabold text-brand-navy">
            {group.label}
          </h2>
          {canManage && <DocumentFormDialog eventId={eventId} typeLabel={group.label} defaultValues={getEmptyDocumentForm(group.tipo)} />}
        </div>
        {group.documents.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            Nenhuma versão publicada: sem ela, o atleta não consegue concluir a inscrição.
          </p>
        ) : (
          <ul className="divide-y">
            {group.documents.map((document) => (
              <DocumentRow key={document.id} document={document} isCurrent={document.id === group.currentId} />
            ))}
          </ul>
        )}
      </section>
    </li>
  )
}
