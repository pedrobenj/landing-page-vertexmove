// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { REGISTRATION_STEP } from "@/enums/registration-step.enum"

/**
 * Navegação privada / cookies bloqueados: ler `sessionStorage` lança `SecurityError`. O `persist` do
 * zustand então não anexa a API `persist` ao store — o formulário precisa funcionar só em memória.
 */
describe("registration form store com sessionStorage bloqueado", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage")

  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, "warn").mockImplementation(() => {})
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError")
      },
    })
  })

  afterEach(() => {
    if (original) Object.defineProperty(globalThis, "sessionStorage", original)
    vi.restoreAllMocks()
  })

  it("considera hidratado, reidrata sem erro e mantém o rascunho em memória", async () => {
    const { hasRegistrationFormHydrated, rehydrateRegistrationForm, subscribeRegistrationFormHydration, useRegistrationFormStore } =
      await import("./registration-form-store")

    expect(hasRegistrationFormHydrated()).toBe(true)
    await expect(rehydrateRegistrationForm()).resolves.toBeUndefined()
    const unsubscribe = subscribeRegistrationFormHydration(() => {})
    expect(() => unsubscribe()).not.toThrow()

    useRegistrationFormStore.getState().start("corrida")
    useRegistrationFormStore.getState().setDistance({ distanciaId: 1, kitId: null, tamanhoCamisaId: null })
    expect(useRegistrationFormStore.getState()).toMatchObject({ eventSlug: "corrida", step: REGISTRATION_STEP.ATHLETE })
  })
})
