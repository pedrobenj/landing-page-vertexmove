import { Handshake } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPartnershipContactHref } from "@/lib/utils"

/** CTA "Quero ser parceiro" (WhatsApp com mensagem pronta ou e-mail). */
export function BecomePartnerButton() {
  const href = getPartnershipContactHref()
  const isExternal = href.startsWith("https://")

  return (
    <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
      <a href={href} {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}>
        <Handshake aria-hidden="true" />
        Quero ser parceiro
        {isExternal && <span className="sr-only">(abre em nova aba)</span>}
      </a>
    </Button>
  )
}
