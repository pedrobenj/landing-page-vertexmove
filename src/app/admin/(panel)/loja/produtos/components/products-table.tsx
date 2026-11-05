import { PackageOpen } from "lucide-react"
import Link from "next/link"
import { connection } from "next/server"

import { EmptyState, ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStoreRepository } from "@/server/repositories/store.repository"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductsTableRow } from "./products-table-row"

export async function ProductsTable() {
  await connection()

  let products: StoreProduct[]
  try {
    products = await getStoreRepository().listAllProducts()
  } catch (error) {
    console.error("[ProductsTable]", error)
    return <ServerError title="Não foi possível carregar os produtos" />
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="Nenhum produto cadastrado."
        action={
          <Button asChild>
            <Link href="/admin/loja/produtos/novo">Cadastrar produto</Link>
          </Button>
        }
      />
    )
  }

  return (
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
  )
}
