import type { Metadata } from "next"

import { SectionBand } from "@/components/sections"

import { AccessLinkRedeemer, InvalidAccessLink } from "./components"

/** Lê o token da URL: renderiza sob demanda, sem shell estático. */
export const instant = false

export const metadata: Metadata = {
  title: "Acesso à inscrição",
  robots: { index: false, follow: false },
}

/**
 * Link de acesso enviado por e-mail (`/inscricao/acesso?t=<token>`, uso único, 30 min). A troca do token
 * pelo cookie da inscrição é feita pela server action (`AccessLinkRedeemer`). `Referrer-Policy: no-referrer`
 * vem do `next.config.ts` (`/inscricao/:path*`): o token não vaza em Referer.
 */
export default async function RegistrationAccessPage({ searchParams }: PageProps<"/inscricao/acesso">) {
  const { t } = await searchParams
  const token = typeof t === "string" ? t.trim() : ""

  return (
    <SectionBand aria-labelledby="acesso-title" className="border-t-0" containerClassName="max-w-4xl gap-8">
      {token ? <AccessLinkRedeemer token={token} /> : <InvalidAccessLink />}
    </SectionBand>
  )
}
