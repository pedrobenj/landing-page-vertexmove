import { describe, expect, it } from "vitest"

import { getPaymentMethodLabel, getReasonLabel, getStatusOriginLabel } from "./admin-registration-labels"

describe("rótulos do detalhe da inscrição e da fila de pagamentos", () => {
  it("traduz os códigos de motivo e mantém texto livre", () => {
    expect(getReasonLabel("cancelamento_admin")).toBe("Cancelada pelo admin")
    expect(getReasonLabel("pagamento_divergente")).toBe("Valor recebido diferente do cobrado")
    expect(getReasonLabel("pedido do atleta")).toBe("pedido do atleta")
  })

  it("traduz a origem da mudança de status e o meio de pagamento", () => {
    expect(getStatusOriginLabel("gateway")).toBe("Mercado Pago")
    expect(getStatusOriginLabel("outro")).toBe("outro")
    expect(getPaymentMethodLabel("bank_transfer")).toBe("Pix")
    expect(getPaymentMethodLabel("ticket")).toBe("ticket")
  })
})
