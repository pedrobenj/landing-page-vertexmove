import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminBackLink, AdminPageBody, AdminPageHero } from "@/components/admin"

import { PartnerRaceFormSkeleton } from "../components"

import { NewPartnerRaceForm } from "./components"

export const metadata: Metadata = { title: "Nova corrida parceira" }

export default function NewPartnerRacePage() {
  return (
    <>
      <AdminPageHero
        id="new-partner-race-title"
        eyebrow="Outras trilhas"
        title="Nova corrida parceira"
        before={<AdminBackLink href="/admin/corridas-parceiras">Corridas parceiras</AdminBackLink>}
      />
      <AdminPageBody>
        {/* Lê a sessão (cookies): fora do shell estático. */}
        <Suspense fallback={<PartnerRaceFormSkeleton />}>
          <NewPartnerRaceForm />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
