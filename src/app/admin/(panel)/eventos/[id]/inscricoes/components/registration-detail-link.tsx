import { Eye } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

interface RegistrationDetailLinkProps {
  eventId: number
  id: number
  codigo: string
  className?: string
}

/** Um só link por inscrição ("Ver inscrição <código>"), para o teclado não passar duas vezes. */
export function RegistrationDetailLink({ eventId, id, codigo, className }: RegistrationDetailLinkProps) {
  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <Link href={`/admin/eventos/${eventId}/inscricoes/${id}`} aria-label={`Ver inscrição ${codigo}`}>
        <Eye aria-hidden="true" /> Ver
      </Link>
    </Button>
  )
}
