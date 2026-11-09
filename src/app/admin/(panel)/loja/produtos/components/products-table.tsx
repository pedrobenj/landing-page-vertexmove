import { PackageOpen } from "lucide-react"
import Link from "next/link"
import { unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { ReadOnlyNotice } from "@/components/admin"
import { EmptyState, ServerError } from "@/components/feedback"
import { StoreUnavailable } from "@/components/store/store-unavailable"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { canManageStore } from "@/lib/utils/admin-permissions"
import { listAdminProducts } from "@/server/api/endpoints/store"
import { isStoreUnavailable } from "@/server/api/is-store-unavailable"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductsTableRow } from "./products-table-row"

export async function ProductsTable() {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  const admin = await requireAdminSession()
  const canManage = canManageStore(admin.papel)

  let products: StoreProduct[]
  try {
    products = await listAdminProducts()
  } catch (error) {
    unstable_rethrow(error)
    if (isStoreUnavailable(error)) return <StoreUnavailable context="admin" />
    console.error("[ProductsTable]", error instanceof Error ? error.name : "erro desconhecido")
    return <ServerError title="Não foi possível carregar os produtos" />
  }

  const newProduct = canManage ? (
    <Button asChild>
      <Link href="/admin/loja/produtos/novo">Novo produto</Link>
    </Button>
  ) : null

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <div className="flex justify-end">{newProduct}</div>
      ) : (
        <ReadOnlyNotice>Seu perfil tem acesso somente leitura aos produtos da loja.</ReadOnlyNotice>
      )}
      {products.length === 0 ? (
        <EmptyState icon={PackageOpen} title="Nenhum produto cadastrado." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <ProductsTableRow key={product.id} product={product} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
