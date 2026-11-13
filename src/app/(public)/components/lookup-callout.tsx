import { Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

/** Cartão "Já se inscreveu?" ao lado da escada: leva à consulta sem login. */
export function LookupCallout() {
  return (
    <div className="flex max-w-sm flex-col gap-3 rounded-2xl bg-brand-navy-deep p-5 text-white shadow-md">
      <p className="font-heading text-lg font-black">Já se inscreveu?</p>
      <p className="text-sm text-white/75">Veja o status da sua inscrição pelo WhatsApp ou CPF, sem login e sem senha.</p>
      <Button asChild variant="cta" size="lg" className="w-full normal-case tracking-normal sm:w-fit">
        <Link href="/consulta">
          <Search aria-hidden="true" />
          Onde está minha inscrição?
        </Link>
      </Button>
    </div>
  )
}
