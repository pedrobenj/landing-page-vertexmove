import { Lock } from "lucide-react"

import { EmptyState } from "@/components/feedback"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { EMPTY_ADMIN_EVENT_FORM } from "@/lib/utils/admin-event-form-values"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { EventForm } from "../../components"

/** Formulário de cadastro, só com sessão válida (o proxy é pulado em prefetch) e papel que pode cadastrar. */
export async function NewEventForm() {
  const admin = await requireAdminSession()
  if (!canManageEvents(admin.papel)) {
    return <EmptyState icon={Lock} title="Você não tem permissão para cadastrar corridas." />
  }
  return <EventForm defaultValues={EMPTY_ADMIN_EVENT_FORM} />
}
