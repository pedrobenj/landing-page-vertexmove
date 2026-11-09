import { Shirt } from "lucide-react"
import { connection } from "next/server"

import { ReadOnlyNotice } from "@/components/admin"
import { EmptyState, ServerError } from "@/components/feedback"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getNextOrder } from "@/lib/utils/next-order"
import { getEmptyShirtSizeForm } from "@/lib/utils/shirt-size-form-values"
import { isApiError } from "@/server/api/api-error"
import { listShirtSizes } from "@/server/api/endpoints/shirt-sizes"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

import { ShirtSizeFormDialog } from "./shirt-size-form-dialog"
import { ShirtSizesTable } from "./shirt-sizes-table"

/** Catálogo global de tamanhos (sessão conferida aqui: o proxy é pulado em prefetch). */
export async function ShirtSizesSection() {
  await connection()
  // Fora do try/catch: o redirect ao login precisa subir.
  const admin = await requireAdminSession()
  const canManage = canManageEvents(admin.papel)

  let shirtSizes: ShirtSize[]
  try {
    shirtSizes = await listShirtSizes()
  } catch (error) {
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar os tamanhos" />
  }

  const newSize = canManage ? <ShirtSizeFormDialog defaultValues={getEmptyShirtSizeForm(getNextOrder(shirtSizes))} /> : undefined

  return (
    <div className="flex flex-col gap-4">
      {canManage ? <div className="flex justify-end">{newSize}</div> : <ReadOnlyNotice>Seu perfil tem acesso somente leitura aos tamanhos.</ReadOnlyNotice>}
      {shirtSizes.length === 0 ? (
        <EmptyState icon={Shirt} title="Nenhum tamanho cadastrado." description="Os kits com camisa usam estes tamanhos." />
      ) : (
        <ShirtSizesTable shirtSizes={shirtSizes} canManage={canManage} />
      )}
    </div>
  )
}
