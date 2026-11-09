import { ExternalLink, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { PublicDocument } from "@/types/api/public-event-detail.interface"

interface RegulationDocumentItemProps {
  document: PublicDocument
}

/** Documento vigente (regulamento ou termo) com versão e botão "Abrir PDF". */
export function RegulationDocumentItem({ document }: RegulationDocumentItemProps) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-text">
        <FileText aria-hidden="true" className="size-6" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="font-heading font-bold text-brand-navy-deep">{document.titulo}</h3>
        <p className="text-sm text-muted-foreground">Versão {document.versao}</p>
      </div>
      <Button asChild variant="outline" size="lg" className="w-full rounded-xl sm:w-auto">
        <a href={document.url} target="_blank" rel="noopener noreferrer">
          Abrir PDF
          <ExternalLink aria-hidden="true" />
          <span className="sr-only">: {document.titulo} (abre em nova aba)</span>
        </a>
      </Button>
    </li>
  )
}
