import { ReadOnlyNotice } from "@/components/admin"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { PaymentsList } from "./payments-list"

/** Confere a sessão (o proxy é pulado em prefetch) e o papel antes de montar a lista client. */
export async function AdminPaymentsList() {
  const admin = await requireAdminSession()
  const canManage = canManageEvents(admin.papel)
  return (
    <>
      {!canManage && <ReadOnlyNotice>Seu perfil tem acesso somente leitura aos pagamentos.</ReadOnlyNotice>}
      <PaymentsList canManage={canManage} />
    </>
  )
}
