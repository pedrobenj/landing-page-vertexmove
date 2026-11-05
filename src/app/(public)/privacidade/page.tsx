import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/layout"

export const metadata: Metadata = { title: "Política de privacidade" }

export default function PrivacyPage() {
  return <PagePlaceholder title="Política de privacidade" description="Como coletamos e tratamos seus dados, conforme a LGPD." />
}
