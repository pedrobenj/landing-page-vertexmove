import { describe, expect, it } from "vitest"

import { isRegistrationCode } from "./is-registration-code"

describe("isRegistrationCode", () => {
  it("aceita o formato da API", () => {
    expect(isRegistrationCode("VX-2026-00000042")).toBe(true)
  })

  it.each(["vx-2026-00000042", "VX-26-00000042", "VX-2026-0000042", "VX-2026-000000420", "VTX-7K3P", "", " VX-2026-00000042"])(
    "rejeita %j",
    (value) => {
      expect(isRegistrationCode(value)).toBe(false)
    },
  )
})
