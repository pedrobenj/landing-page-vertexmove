"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"

import { validateCartAction } from "@/app/actions/store"
import { useCartHydrated } from "@/hooks/use-cart-hydrated"
import { queryKeys } from "@/lib/utils"
import { useCartStore } from "@/stores/cart-store"

/** Carrinho precificado pelo servidor. Aplica automaticamente os avisos (esgotado, estoque menor). */
export function usePricedCart() {
  const hydrated = useCartHydrated()
  const items = useCartStore((state) => state.items)
  const applyIssues = useCartStore((state) => state.applyIssues)

  const query = useQuery({
    queryKey: queryKeys.store.cart(items),
    queryFn: async () => {
      const response = await validateCartAction(items)
      if (!response.data) throw new Error(response.title ?? "Não foi possível carregar o carrinho")
      return response.data
    },
    enabled: hydrated && items.length > 0,
    // Exceção à regra de 5 min do CLAUDE.md: preço e estoque precisam estar sempre atuais no carrinho.
    staleTime: 0,
    // Mantém o carrinho anterior na tela enquanto recalcula (sem skeleton nem perda de foco a cada +/−).
    placeholderData: keepPreviousData,
  })

  const issues = query.data?.issues
  useEffect(() => {
    if (!issues || issues.length === 0) return
    for (const issue of issues) toast.warning(issue.message)
    applyIssues(issues)
  }, [issues, applyIssues])

  return { ...query, hydrated, isEmpty: hydrated && items.length === 0 }
}
