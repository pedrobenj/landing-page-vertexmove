import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/layout"

export const metadata: Metadata = { title: "Regulamento" }

export default function RegulationPage() {
  return <PagePlaceholder title="Regulamento" description="Regulamento completo do evento." />
}
