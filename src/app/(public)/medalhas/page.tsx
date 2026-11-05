import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/layout"

export const metadata: Metadata = { title: "Medalhas" }

export default function MedalsPage() {
  return <PagePlaceholder title="Complete sua coleção" description="Medalhas de edições anteriores. A compra é somente da medalha física e não gera inscrição." />
}
