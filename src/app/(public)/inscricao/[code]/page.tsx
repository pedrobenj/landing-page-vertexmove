import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/layout"

export const metadata: Metadata = { title: "Minha inscrição" }

export default function RegistrationStatusPage() {
  return <PagePlaceholder title="Status da inscrição" description="QR Code Pix, copia-e-cola, status do pagamento e dados da prova." />
}
