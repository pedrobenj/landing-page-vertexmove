import type { Metadata } from "next"
import Link from "next/link"

import { PageHero, SectionBand } from "@/components/sections"

import { LgpdRequestForm } from "./components"

export const metadata: Metadata = {
  title: "Solicitação sobre seus dados",
  description: "Peça acesso, correção, eliminação ou portabilidade dos seus dados pessoais, conforme a LGPD.",
  alternates: { canonical: "/privacidade/solicitacao" },
}

export default function LgpdRequestPage() {
  return (
    <>
      <PageHero
        id="lgpd-request-title"
        eyebrow="LGPD"
        title="Solicitação sobre seus dados"
        description="Exerça os direitos da Lei Geral de Proteção de Dados. Você recebe um protocolo com o prazo, e a resposta chega pelo contato que informar."
        containerClassName="max-w-3xl"
      />
      <SectionBand className="border-t-0" containerClassName="max-w-3xl">
        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Antes de enviar, veja na{" "}
            <Link href="/privacidade" className="font-semibold text-brand-navy underline underline-offset-4">
              política de privacidade
            </Link>{" "}
            quais dados tratamos e para quê. O CPF serve só para localizar seus dados; ele não aparece em nenhuma tela pública.
          </p>
          <LgpdRequestForm />
        </div>
      </SectionBand>
    </>
  )
}
