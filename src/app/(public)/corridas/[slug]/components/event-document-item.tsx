import { ExternalLink, FileText } from "lucide-react"

import type { PublicDocument } from "@/types/api/public-event-detail.interface"

interface EventDocumentItemProps {
  document: PublicDocument
}

/** Documento vigente (regulamento, termo) com link para o arquivo. */
export function EventDocumentItem({ document }: EventDocumentItemProps) {
  return (
    <li>
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-text">
          <FileText aria-hidden="true" className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-heading font-bold text-brand-navy-deep group-hover:underline">{document.titulo}</span>
          <span className="text-sm text-muted-foreground">Versão {document.versao}</span>
        </span>
        <ExternalLink aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    </li>
  )
}
