import { Clock, KeyRound } from "lucide-react"

import { ADMIN_PASSWORD_CHANGED_PARAM, ADMIN_SESSION_EXPIRED_PARAM } from "@/lib/utils/constants"

interface SessionExpiredNoticeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Aviso quando o admin chega ao login vindo de `/admin/sair` (sessão expirada ou revogada) ou depois de
 * trocar a própria senha (o backend encerra todas as sessões).
 */
export async function SessionExpiredNotice({ searchParams }: SessionExpiredNoticeProps) {
  const params = await searchParams
  if (params[ADMIN_PASSWORD_CHANGED_PARAM]) {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-xl bg-brand-green/15 px-4 py-3 text-sm font-medium text-brand-navy-deep"
      >
        <KeyRound aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        Senha alterada. Entre de novo com a senha nova.
      </p>
    )
  }
  if (!params[ADMIN_SESSION_EXPIRED_PARAM]) return null

  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-xl bg-brand-green/15 px-4 py-3 text-sm font-medium text-brand-navy-deep"
    >
      <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      Sua sessão expirou. Entre novamente para continuar.
    </p>
  )
}
