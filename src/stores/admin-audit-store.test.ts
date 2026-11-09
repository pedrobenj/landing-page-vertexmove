import { beforeEach, describe, expect, it } from "vitest"

import { useAdminAuditStore } from "./admin-audit-store"

const store = () => useAdminAuditStore.getState()

describe("admin audit store", () => {
  beforeEach(() => store().reset())

  it("avança, volta e reinicia pela pilha de cursores", () => {
    store().nextPage("40")
    store().nextPage("20")
    expect(store()).toMatchObject({ cursor: "20", cursorStack: ["40", "20"] })
    store().prevPage()
    expect(store()).toMatchObject({ cursor: "40", cursorStack: ["40"] })
    store().prevPage()
    store().prevPage()
    expect(store()).toMatchObject({ cursor: null, cursorStack: [] })
    store().nextPage("40")
    store().reset()
    expect(store()).toMatchObject({ cursor: null, cursorStack: [] })
  })
})
