import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminBackLink, AdminPageBody, AdminPageHero } from "@/components/admin"

import { ProductFormSkeleton } from "../components"

import { NewProductForm } from "./components"

export const metadata: Metadata = { title: "Novo produto" }

export default function NewProductPage() {
  return (
    <>
      <AdminPageHero
        id="new-product-title"
        eyebrow="Loja"
        title="Novo produto"
        before={<AdminBackLink href="/admin/loja/produtos">Produtos da loja</AdminBackLink>}
      />
      <AdminPageBody>
        {/* Lê a sessão (cookies) e o useFieldArray gera ids com crypto.randomUUID() no render: fora do shell estático. */}
        <Suspense fallback={<ProductFormSkeleton />}>
          <NewProductForm />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
