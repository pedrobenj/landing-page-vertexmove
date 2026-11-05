import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { PRODUCT_TYPE_LABEL } from "@/enums/product-type.enum"
import { formatCurrency, getTotalStock } from "@/lib/utils"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductLinkPendingIndicator } from "./product-link-pending-indicator"

interface ProductsTableRowProps {
  product: StoreProduct
}

export function ProductsTableRow({ product }: ProductsTableRowProps) {
  const totalStock = getTotalStock(product)
  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/admin/loja/produtos/${product.id}`}
          className="inline-flex items-center gap-1.5 font-semibold text-brand-navy hover:underline"
        >
          {product.name}
          <ProductLinkPendingIndicator />
        </Link>
        <p className="text-xs text-muted-foreground">/{product.slug}</p>
      </TableCell>
      <TableCell>{PRODUCT_TYPE_LABEL[product.type]}</TableCell>
      <TableCell className="tabular-nums">{formatCurrency(product.price)}</TableCell>
      <TableCell className="tabular-nums">{totalStock === 0 ? <Badge variant="secondary">Esgotado</Badge> : totalStock}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Badge variant={product.isActive ? "default" : "outline"}>{product.isActive ? "Ativo" : "Inativo"}</Badge>
          {product.isFeatured && <Badge className="bg-cta text-cta-foreground">Destaque</Badge>}
        </div>
      </TableCell>
    </TableRow>
  )
}
