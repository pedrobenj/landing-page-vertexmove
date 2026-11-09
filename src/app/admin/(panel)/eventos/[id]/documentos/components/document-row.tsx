import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils/format-date"
import type { EventDocument } from "@/types/api/document.interface"

interface DocumentRowProps {
  document: EventDocument
  isCurrent: boolean
}

export function DocumentRow({ document, isCurrent }: DocumentRowProps) {
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{document.titulo}</p>
          <Badge variant="outline">v{document.versao}</Badge>
          {isCurrent && <Badge className="bg-cta text-cta-foreground">Vigente</Badge>}
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">Vale a partir de {formatDateTime(document.vigenteEm)}</p>
        <p className="font-mono text-[0.7rem] break-all text-muted-foreground">SHA-256 {document.hashSha256}</p>
      </div>
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-navy hover:underline"
      >
        Abrir arquivo <ExternalLink className="size-4" aria-hidden="true" />
        <span className="sr-only">
          {document.titulo} versão {document.versao} (abre em nova aba)
        </span>
      </a>
    </li>
  )
}
