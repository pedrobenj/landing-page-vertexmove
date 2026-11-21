import { beforeEach, describe, expect, it } from "vitest"

import { ORDER_STATUS } from "@/enums/order-status.enum"

import { useAdminStoreOrdersFiltersStore } from "./admin-store-orders-filters-store"
import { resetAdminStores } from "./reset-admin-stores"

const store = () => useAdminStoreOrdersFiltersStore.getState()

describe("admin store orders filters store", () => {
  beforeEach(() => store().reset())

  it("começa em todos, na primeira página", () => {
    expect(store()).toMatchObject({ status: "todos", cursor: null, cursorStack: [] })
  })

  it("avança e volta pelas páginas; trocar o filtro volta à primeira", () => {
    store().nextPage("VTX-P-AAAAA-AAAAA")
    store().nextPage("VTX-P-BBBBB-BBBBB")
    store().prevPage()
    expect(store()).toMatchObject({ cursor: "VTX-P-AAAAA-AAAAA", cursorStack: ["VTX-P-AAAAA-AAAAA"] })
    store().setStatus(ORDER_STATUS.PAID)
    expect(store()).toMatchObject({ status: ORDER_STATUS.PAID, cursor: null, cursorStack: [] })
  })

  it("é limpo no logout com os demais filtros do admin", () => {
    store().setStatus(ORDER_STATUS.PENDING)
    resetAdminStores()
    expect(store().status).toBe("todos")
  })
})
