import { ServerError } from "@/components/feedback"

import { AdminPageBody } from "./admin-page-body"
import { AdminPageHero } from "./admin-page-hero"

interface AdminPageErrorProps {
  eyebrow: string
  title: string
  message: string
}

/** Página do admin que não conseguiu carregar: mesma faixa navy, erro no corpo. */
export function AdminPageError({ eyebrow, title, message }: AdminPageErrorProps) {
  return (
    <>
      <AdminPageHero id="admin-page-error-title" eyebrow={eyebrow} title={title} />
      <AdminPageBody>
        <ServerError title={message} />
      </AdminPageBody>
    </>
  )
}
