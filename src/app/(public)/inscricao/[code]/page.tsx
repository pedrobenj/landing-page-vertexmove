import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RegistrationPaymentPanel } from "@/components/registration-payment"
import { SectionBand } from "@/components/sections"
import { isRegistrationCode } from "@/lib/utils"

/** O `notFound()` precisa rodar antes do streaming para responder 404. */
export const instant = false

export const metadata: Metadata = {
  title: "Minha inscrição",
  robots: { index: false, follow: false },
}

/** Status da inscrição por código e "Pagar agora" (Checkout Pro) enquanto estiver pendente. */
export default async function RegistrationStatusPage({ params }: PageProps<"/inscricao/[code]">) {
  const { code } = await params
  if (!isRegistrationCode(code)) notFound()

  return (
    <SectionBand aria-labelledby="inscricao-title" className="border-t-0" containerClassName="max-w-4xl gap-8">
      <RegistrationPaymentPanel code={code} />
    </SectionBand>
  )
}
