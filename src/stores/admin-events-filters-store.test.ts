import { beforeEach, describe, expect, it } from "vitest"

import { EVENT_STATUS } from "@/enums/event-status.enum"

import { useAdminEventsFiltersStore } from "./admin-events-filters-store"

const store = () => useAdminEventsFiltersStore.getState()

describe("admin events filters store", () => {
  beforeEach(() => store().reset())

  it("começa em todos, na primeira página", () => {
    expect(store()).toMatchObject({ status: "todos", cursor: null, cursorStack: [] })
  })

  it("avança e volta pelas páginas com a pilha de cursores", () => {
    store().nextPage("10")
    store().nextPage("20")
    expect(store()).toMatchObject({ cursor: "20", cursorStack: ["10", "20"] })

    store().prevPage()
    expect(store()).toMatchObject({ cursor: "10", cursorStack: ["10"] })

    store().prevPage()
    expect(store()).toMatchObject({ cursor: null, cursorStack: [] })
  })

  it("voltar na primeira página não faz nada", () => {
    store().prevPage()
    expect(store()).toMatchObject({ cursor: null, cursorStack: [] })
  })

  it("trocar o status volta para a primeira página", () => {
    store().nextPage("10")
    store().setStatus(EVENT_STATUS.DRAFT)
    expect(store()).toMatchObject({ status: EVENT_STATUS.DRAFT, cursor: null, cursorStack: [] })
  })

  it("reset volta ao estado inicial", () => {
    store().setStatus(EVENT_STATUS.PUBLISHED)
    store().nextPage("10")
    store().reset()
    expect(store()).toMatchObject({ status: "todos", cursor: null, cursorStack: [] })
  })
})
