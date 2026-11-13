import { describe, expect, it } from "vitest"

import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

import { toRegistrationDetails } from "./to-registration-details"

const base = {
  codigo: "VX-2026-00000042",
  status: REGISTRATION_STATUS.PENDING,
  expiraEm: "2026-11-12T15:00:00Z",
  valorTotalCentavos: 8000,
  eventoNome: "Corrida",
  distanciaNome: "5 km",
}

describe("toRegistrationDetails", () => {
  it("converte a resposta do backend", () => {
    expect(
      toRegistrationDetails({
        ...base,
        pagamento: { pagamentoId: 1, status: PAYMENT_STATUS.PENDING, checkoutUrl: null, expiraEm: null, gatewayPreferenceId: null },
      }),
    ).toEqual({
      codigo: "VX-2026-00000042",
      status: REGISTRATION_STATUS.PENDING,
      evento: { slug: null, nome: "Corrida", dataEvento: null, horarioLargada: null },
      distancia: "5 km",
      valorBaseCentavos: null,
      valorDescontoCentavos: null,
      valorTotalCentavos: 8000,
      pagamento: { status: PAYMENT_STATUS.PENDING },
    })
  })

  it("usa slug, data e largada quando o backend envia", () => {
    const details = toRegistrationDetails({
      ...base,
      eventoSlug: "corrida",
      dataEvento: "2026-12-10",
      horarioLargada: "05:30",
      pagamento: null,
    })
    expect(details.evento).toEqual({ slug: "corrida", nome: "Corrida", dataEvento: "2026-12-10", horarioLargada: "05:30" })
    expect(details.pagamento).toBeNull()
  })
})
