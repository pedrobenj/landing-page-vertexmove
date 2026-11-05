const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

/** Recebe o valor em centavos (integer) e devolve "R$ 89,90". */
export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100)
}
