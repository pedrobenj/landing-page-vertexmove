import { toProductFormValues } from "@/lib/utils"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductForm } from "../../components"

interface EditProductProps {
  product: StoreProduct
}

export function EditProduct({ product }: EditProductProps) {
  return (
    <>
      <h1 className="text-2xl font-extrabold text-brand-navy">{product.name}</h1>
      <ProductForm defaultValues={toProductFormValues(product)} productId={product.id} />
    </>
  )
}
