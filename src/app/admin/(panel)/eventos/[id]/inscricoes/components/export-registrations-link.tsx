import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ExportRegistrationsLinkProps {
  eventId: number
}

/**
 * Baixa o CSV pelo route handler do Next, que repassa o download do backend em streaming: o navegador
 * nunca vê o token. Link comum (`download`), sem JS.
 */
export function ExportRegistrationsLink({ eventId }: ExportRegistrationsLinkProps) {
  return (
    <Button asChild variant="cta" className="w-full md:w-auto">
      <a href={`/admin/eventos/${eventId}/inscricoes/export`} download>
        <Download aria-hidden="true" /> Exportar CSV
      </a>
    </Button>
  )
}
