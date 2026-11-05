import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/layout"

export const metadata: Metadata = { title: "Inscrição" }

export default function RegistrationPage() {
  return <PagePlaceholder title="Inscrição" description="Formulário em etapas: modalidade e kit → dados do atleta → termos → pagamento." />
}
