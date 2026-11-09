import { Lock } from "lucide-react"

import { EmptyState } from "@/components/feedback"
import { EMPTY_PRODUCT_FORM } from "@/lib/utils"
import { canManageStore } from "@/lib/utils/admin-permissions"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { ProductForm } from "../../components"

/** Formulário de cadastro, só com sessão válida (o proxy é pulado em prefetch) e papel que pode cadastrar. */
export async function NewProductForm() {
  const admin = await requireAdminSession()
  if (!canManageStore(admin.papel)) {
    return <EmptyState icon={Lock} title="Você não tem permissão para cadastrar produtos." />
  }
  return <ProductForm defaultValues={EMPTY_PRODUCT_FORM} />
}
