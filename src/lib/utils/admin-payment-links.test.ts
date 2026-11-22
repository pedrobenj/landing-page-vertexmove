import { describe, expect, it } from "vitest"

import { getPaymentOrigin } from "./admin-payment-links"

describe("origem do pagamento na fila do admin", () => {
  it("inscrição → detalhe da inscrição na corrida", () => {
    expect(getPaymentOrigin({ origem: { tipo: "inscricao", inscricaoId: 20, eventoId: 3, codigo: "VX-2026-00000020" } })).toEqual({
      label: "Inscrição VX-2026-00000020",
      href: "/admin/eventos/3/inscricoes/20",
    })
  })

  it("pedido da loja → detalhe do pedido", () => {
    expect(getPaymentOrigin({ origem: { tipo: "pedido_loja", pedidoLojaId: 40, codigo: "VTX-P-7K3PQ-M9X2D" } })).toEqual({
      label: "Pedido VTX-P-7K3PQ-M9X2D",
      href: "/admin/loja/pedidos/VTX-P-7K3PQ-M9X2D",
    })
  })
})
