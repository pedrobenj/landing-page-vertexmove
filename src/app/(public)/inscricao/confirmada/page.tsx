import type { Metadata } from "next"

import { SectionBand } from "@/components/sections"

import { RegistrationConfirmation } from "./components"

export const metadata: Metadata = {
  title: "Inscrição realizada",
  robots: { index: false, follow: false },
}

export default function RegistrationConfirmedPage() {
  return (
    <SectionBand aria-labelledby="confirmada-title" className="border-t-0" spacing="compact" containerClassName="max-w-4xl gap-8">
      <RegistrationConfirmation />
    </SectionBand>
  )
}
