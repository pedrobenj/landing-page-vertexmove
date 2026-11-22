import { Lock } from "lucide-react"

import { EmptyState } from "@/components/feedback"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getEmptyPartnerRaceForm } from "@/lib/utils/partner-race-form-values"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { PartnerRaceForm } from "../../components"

/** Formulário de cadastro, só com sessão válida (o proxy é pulado em prefetch) e papel que pode cadastrar. */
export async function NewPartnerRaceForm() {
  const admin = await requireAdminSession()
  if (!canManageEvents(admin.papel)) {
    return <EmptyState icon={Lock} title="Você não tem permissão para cadastrar corridas parceiras." />
  }
  return <PartnerRaceForm defaultValues={getEmptyPartnerRaceForm()} />
}
