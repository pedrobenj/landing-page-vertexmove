import { AdminBackLink, AdminPageBody, AdminPageHero, ReadOnlyNotice } from "@/components/admin"
import { toProductFormValues } from "@/lib/utils"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductForm } from "../../components"

interface EditProductProps {
  product: StoreProduct
  canManage: boolean
}

export function EditProduct({ product, canManage }: EditProductProps) {
  return (
    <>
      <AdminPageHero
        id="edit-product-title"
        eyebrow="Loja"
        title={product.name}
        before={<AdminBackLink href="/admin/loja/produtos">Produtos da loja</AdminBackLink>}
      />
      <AdminPageBody>
        {!canManage && <ReadOnlyNotice>Seu perfil tem acesso somente leitura aos produtos da loja.</ReadOnlyNotice>}
        <ProductForm defaultValues={toProductFormValues(product)} productId={product.id} canManage={canManage} />
      </AdminPageBody>
    </>
  )
}
