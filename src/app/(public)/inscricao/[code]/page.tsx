import { Search } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { isRegistrationCode } from "@/lib/utils"

/** Sem dados a buscar, mas o `notFound()` precisa rodar antes do streaming para responder 404. */
export const instant = false

export const metadata: Metadata = {
  title: "Minha inscrição",
  robots: { index: false, follow: false },
}

/**
 * Status da inscrição por código.
 * TODO(backend): não há `GET /inscricoes/:codigo` (§16) — quando houver, mostrar status, valores e o Pix aqui.
 */
export default async function RegistrationStatusPage({ params }: PageProps<"/inscricao/[code]">) {
  const { code } = await params
  if (!isRegistrationCode(code)) notFound()

  return (
    <SectionBand aria-labelledby="inscricao-title" className="border-t-0" containerClassName="max-w-4xl">
      <SectionHeading
        as="h1"
        id="inscricao-title"
        eyebrow={`Inscrição ${code}`}
        title="Acompanhe sua inscrição"
        description="Por enquanto, o status da inscrição fica na consulta: informe o WhatsApp ou o CPF usado na inscrição e veja tudo, sem login e sem senha."
      />
      <div className="flex flex-col gap-4 rounded-2xl border bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Guarde o código <strong className="font-heading text-brand-navy-deep">{code}</strong>: ele identifica sua
          inscrição quando você falar com a gente.
        </p>
        <Button asChild variant="cta" size="xl" className="w-full shrink-0 normal-case tracking-normal sm:w-auto">
          <Link href="/consulta">
            <Search aria-hidden="true" />
            Consultar minha inscrição
          </Link>
        </Button>
      </div>
    </SectionBand>
  )
}
