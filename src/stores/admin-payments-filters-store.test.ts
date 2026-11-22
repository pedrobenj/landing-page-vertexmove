import { beforeEach, describe, expect, it } from "vitest"

import { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"

import { useAdminPaymentsFiltersStore } from "./admin-payments-filters-store"
import { resetAdminStores } from "./reset-admin-stores"

const store = () => useAdminPaymentsFiltersStore.getState()

describe("admin payments filters store", () => {
  beforeEach(() => store().reset())

  it("começa em todas as pendências, na primeira página", () => {
    expect(store()).toMatchObject({ situacao: "todas", cursor: null, cursorStack: [] })
  })

  it("trocar a situação volta à primeira página", () => {
    store().nextPage("9")
    store().setSituacao(PAYMENT_ISSUE.MISMATCH)
    expect(store()).toMatchObject({ situacao: "divergente", cursor: null, cursorStack: [] })
  })

  it("é limpo no logout", () => {
    store().setSituacao(PAYMENT_ISSUE.UNDER_REVIEW)
    resetAdminStores()
    expect(store().situacao).toBe("todas")
  })
})
