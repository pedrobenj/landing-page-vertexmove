import { Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { SectionHeading } from "./section-heading"

// TODO: substituir pelo formulário de consulta inline (server action com rate limit — CPF nunca na URL).
export function LookupSection() {
  return (
    <section aria-labelledby="consulta-title" className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14">
      <SectionHeading id="consulta-title" eyebrow="Sem login, sem senha" title="Consulte sua inscrição" />
      <p className="max-w-md text-center text-muted-foreground">
        Informe o WhatsApp ou o CPF usado na inscrição para ver o status e os dados da prova.
      </p>
      <Button asChild size="xl">
        <Link href="/consulta">
          <Search aria-hidden="true" /> Consultar agora
        </Link>
      </Button>
    </section>
  )
}
