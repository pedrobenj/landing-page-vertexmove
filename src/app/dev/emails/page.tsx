import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { env } from "@/lib/env"
import { listMockAccessEmails } from "@/server/api/endpoints/registration-access"

import { MockEmailItem } from "./components"

/** Só existe no modo mock: o `notFound()` precisa rodar antes do streaming. */
export const instant = false

export const metadata: Metadata = {
  title: "Caixa de entrada simulada",
  robots: { index: false, follow: false },
}

/**
 * Caixa de entrada falsa do modo mock (`USE_MOCK_API`): os e-mails com o link de acesso que o backend
 * enviaria (fase 6). Faz o papel do e-mail do atleta no dev e nos e2e; fora do mock, 404.
 */
export default async function MockInboxPage() {
  if (!env.USE_MOCK_API) notFound()
  const emails = await listMockAccessEmails()

  return (
    <main className="flex flex-1 justify-center bg-slate-100 px-4 py-12">
      <section aria-labelledby="mock-inbox-title" className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Modo mock · não é um e-mail real</p>
          <h1 id="mock-inbox-title" className="font-heading text-2xl font-black text-brand-navy-deep">
            Caixa de entrada simulada
          </h1>
        </div>
        {emails.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum e-mail enviado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {emails.map((email) => (
              <MockEmailItem key={email.link} email={email} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
