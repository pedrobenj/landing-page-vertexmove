import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/layout"

export const metadata: Metadata = { title: "Corrida" }

export default function EventPage() {
  return <PagePlaceholder title="Página da corrida" description="Banner, data e largada, local, modalidades e preços do lote atual, kit, percurso, retirada de kit, regulamento e FAQ." />
}
