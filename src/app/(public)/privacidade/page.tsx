import type { Metadata } from "next"

import { PageHero, SectionBand } from "@/components/sections"
import { formatApiDate, PRIVACY_POLICY_UPDATED_AT } from "@/lib/utils"

import { PrivacyPolicyContent } from "./components"

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como o Vertex Grupo de Corrida coleta, usa e protege seus dados pessoais, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        id="privacidade-title"
        eyebrow="LGPD"
        title="Política de privacidade"
        description={`Seus dados são tratados com cuidado e só para o que é necessário. Última atualização: ${formatApiDate(PRIVACY_POLICY_UPDATED_AT)}.`}
        containerClassName="max-w-3xl"
      />
      <SectionBand className="border-t-0" containerClassName="max-w-3xl">
        <PrivacyPolicyContent />
      </SectionBand>
    </>
  )
}
