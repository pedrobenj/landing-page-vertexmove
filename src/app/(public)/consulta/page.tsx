import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/layout"

export const metadata: Metadata = { title: "Consultar inscrição" }

export default function LookupPage() {
  return <PagePlaceholder title="Consultar inscrição" description="Informe o WhatsApp ou o CPF usado na inscrição." />
}
