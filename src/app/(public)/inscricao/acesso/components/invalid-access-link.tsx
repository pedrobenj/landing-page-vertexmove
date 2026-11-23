import { LinkIcon } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/feedback"
import { SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { ACCESS_LINK_INVALID_MESSAGE } from "@/lib/utils/registration-access-messages"

/** Link sem token, vencido ou já usado: orienta a pedir outro na consulta. */
export function InvalidAccessLink() {
  return (
    <>
      <SectionHeading as="h1" id="acesso-title" eyebrow="Acesso à inscrição" title="Link inválido ou expirado" />
      <EmptyState
        icon={LinkIcon}
        title="Peça um novo link"
        description={ACCESS_LINK_INVALID_MESSAGE}
        action={
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <Link href="/consulta">Pedir um novo link</Link>
          </Button>
        }
      />
    </>
  )
}
