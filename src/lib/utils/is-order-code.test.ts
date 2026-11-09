import { describe, expect, it } from "vitest"

import { isOrderCode } from "./is-order-code"

describe("isOrderCode", () => {
  it("aceita o formato gerado para os pedidos", () => {
    expect(isOrderCode("VTX-P-7K3PQ-M9X2D")).toBe(true)
  })

  it.each(["VTX-P-7K3P", "VTX-P-7K3PQM9X2D", "vtx-p-7k3pq-m9x2d", "VTX-P-7K3PQ-M9X2O", "VTX-P-7K3PQ-M9X21", "VX-2026-00000042", ""])(
    "rejeita %j",
    (value) => {
      expect(isOrderCode(value)).toBe(false)
    },
  )
})
