import { ReadOnlyNotice } from "@/components/admin"
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
      <h1 className="text-2xl font-extrabold text-brand-navy">{product.name}</h1>
      {!canManage && <ReadOnlyNotice>Seu perfil tem acesso somente leitura aos produtos da loja.</ReadOnlyNotice>}
      <ProductForm defaultValues={toProductFormValues(product)} productId={product.id} canManage={canManage} />
    </>
  )
}
