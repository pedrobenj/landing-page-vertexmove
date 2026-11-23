import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { AccountDetails, AccountDetailsSkeleton, ChangePasswordForm } from "./components"

export const metadata: Metadata = { title: "Minha conta" }

export default function AccountPage() {
  return (
    <>
      <AdminPageHero id="account-title" eyebrow="Equipe" title="Minha conta" />
      <AdminPageBody>
        <div className="flex max-w-xl flex-col gap-8">
          <Suspense fallback={<AccountDetailsSkeleton />}>
            <AccountDetails />
          </Suspense>
          <section aria-labelledby="change-password-title" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="change-password-title" className="font-heading text-lg font-black text-brand-navy-deep">
                Trocar senha
              </h2>
              <p className="text-sm text-muted-foreground">
                Ao trocar, todas as suas sessões são encerradas (inclusive esta) e você entra de novo com a senha nova.
              </p>
            </div>
            <ChangePasswordForm />
          </section>
        </div>
      </AdminPageBody>
    </>
  )
}
