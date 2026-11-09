import type { CartIssue } from "@/types/cart.interface"

/**
 * Id estável do toast de um aviso do carrinho: o mesmo aviso (variante + motivo + quantidade) vindo
 * de novo — carrinho e checkout montados, refetch, StrictMode — atualiza o toast em vez de empilhar.
 */
export function getCartIssueToastId(issue: CartIssue): string {
  return `cart-issue:${issue.variantId}:${issue.reason}:${issue.availableQuantity}`
}
