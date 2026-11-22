import { describe, expect, it } from "vitest"

import { getPaymentOrigin } from "./admin-payment-links"

describe("origem do pagamento na fila do admin", () => {
  it("inscrição → detalhe da inscrição na corrida", () => {
    expect(getPaymentOrigin({ inscricao: { id: 20, codigo: "VX-2026-00000020", eventoId: 1 }, pedidoLoja: null })).toEqual({
      label: "Inscrição VX-2026-00000020",
      href: "/admin/eventos/1/inscricoes/20",
    })
  })

  it("pedido da loja → detalhe do pedido", () => {
    expect(getPaymentOrigin({ inscricao: null, pedidoLoja: { codigo: "VTX-P-7K3PQ-M9X2D" } })).toEqual({
      label: "Pedido VTX-P-7K3PQ-M9X2D",
      href: "/admin/loja/pedidos/VTX-P-7K3PQ-M9X2D",
    })
  })

  it("sem origem conhecida → null", () => {
    expect(getPaymentOrigin({ inscricao: null, pedidoLoja: null })).toBeNull()
  })
})
