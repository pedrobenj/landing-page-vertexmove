import { EMPTY_PRODUCT_FORM } from "@/lib/utils"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { ProductForm } from "../../components"

/** Formulário de cadastro, só renderizado com sessão válida (o proxy é pulado em prefetch). */
export async function NewProductForm() {
  await requireAdminSession()
  return <ProductForm defaultValues={EMPTY_PRODUCT_FORM} />
}
