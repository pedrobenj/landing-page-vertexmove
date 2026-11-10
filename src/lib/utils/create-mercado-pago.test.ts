import { afterEach, describe, expect, it, vi } from "vitest"

import { createMercadoPago } from "./create-mercado-pago"

describe("createMercadoPago", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("devolve null quando o script não carregou", () => {
    vi.stubGlobal("window", {})
    expect(createMercadoPago("TEST-123")).toBeNull()
  })

  it("devolve null sem Public Key", () => {
    const MercadoPago = vi.fn()
    vi.stubGlobal("window", { MercadoPago })
    expect(createMercadoPago("")).toBeNull()
    expect(MercadoPago).not.toHaveBeenCalled()
  })

  it("instancia o SDK com a chave e locale pt-BR", () => {
    const instance = { bricks: vi.fn() }
    const MercadoPago = vi.fn(function MercadoPagoMock() {
      return instance
    })
    vi.stubGlobal("window", { MercadoPago })
    expect(createMercadoPago("TEST-123")).toBe(instance)
    expect(MercadoPago).toHaveBeenCalledWith("TEST-123", { locale: "pt-BR" })
  })
})
