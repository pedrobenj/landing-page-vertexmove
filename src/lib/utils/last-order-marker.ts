const LAST_ORDER_KEY = "vertex-last-order"

/** Marca o pedido recém-criado no checkout (sessionStorage), antes de navegar para a página do pedido. */
export function markLastOrder(code: string): void {
  try {
    sessionStorage.setItem(LAST_ORDER_KEY, code)
  } catch {
    // Storage bloqueado: o carrinho só não é limpo automaticamente.
  }
}

/** true (e remove a marca) se o pedido `code` acabou de ser criado nesta aba. */
export function consumeLastOrder(code: string): boolean {
  try {
    if (sessionStorage.getItem(LAST_ORDER_KEY) !== code) return false
    sessionStorage.removeItem(LAST_ORDER_KEY)
    return true
  } catch {
    return false
  }
}
