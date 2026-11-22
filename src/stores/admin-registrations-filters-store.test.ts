import { beforeEach, describe, expect, it } from "vitest"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

import { useAdminRegistrationsFiltersStore } from "./admin-registrations-filters-store"
import { resetAdminStores } from "./reset-admin-stores"

const store = () => useAdminRegistrationsFiltersStore.getState()

describe("admin registrations filters store", () => {
  beforeEach(() => store().reset())

  it("começa sem filtros, na primeira página", () => {
    expect(store()).toMatchObject({ eventId: null, status: "todos", distanciaId: null, busca: "", cursor: null, cursorStack: [] })
  })

  it("trocar qualquer filtro volta à primeira página", () => {
    store().setEvent(1)
    store().nextPage("20")
    store().setStatus(REGISTRATION_STATUS.CONFIRMED)
    expect(store()).toMatchObject({ status: "confirmada", cursor: null, cursorStack: [] })
    store().nextPage("20")
    store().setDistance(2)
    expect(store()).toMatchObject({ distanciaId: 2, cursor: null })
    store().nextPage("20")
    store().setSearch("ana")
    expect(store()).toMatchObject({ busca: "ana", cursor: null })
  })

  it("avança e volta pelas páginas", () => {
    store().nextPage("20")
    store().nextPage("40")
    store().prevPage()
    expect(store()).toMatchObject({ cursor: "20", cursorStack: ["20"] })
    store().prevPage()
    expect(store()).toMatchObject({ cursor: null, cursorStack: [] })
  })

  it("outra corrida limpa os filtros; a mesma corrida os mantém", () => {
    store().setEvent(1)
    store().setStatus(REGISTRATION_STATUS.PENDING)
    store().setEvent(1)
    expect(store().status).toBe("pendente")
    store().setEvent(2)
    expect(store()).toMatchObject({ eventId: 2, status: "todos", distanciaId: null, busca: "" })
  })

  it("é limpo no logout com os demais filtros do admin", () => {
    store().setSearch("ana")
    resetAdminStores()
    expect(store().busca).toBe("")
  })
})
