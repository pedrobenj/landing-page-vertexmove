import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { AdminsTable, AdminsTableSkeleton } from "./components"

export const metadata: Metadata = { title: "Admins" }

export default function AdminsPage() {
  return (
    <>
      <AdminPageHero
        id="admins-title"
        eyebrow="Equipe"
        title="Admins"
        description="Quem acessa o painel. A senha temporária aparece uma única vez: copie e envie à pessoa por um canal seguro."
      />
      <AdminPageBody>
        <Suspense fallback={<AdminsTableSkeleton />}>
          <AdminsTable />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
