import { describe, expect, it } from "vitest"

import { EVENT_STATUS } from "@/enums/event-status.enum"

import { getReadinessSummary } from "./get-readiness-summary"

describe("getReadinessSummary", () => {
  it("publicada e pronta abre inscrições; rascunho pronto só falta publicar", () => {
    expect(getReadinessSummary({ ready: true, missing: [] }, EVENT_STATUS.PUBLISHED)).toBe("Pronta para inscrições")
    expect(getReadinessSummary({ ready: true, missing: [] }, EVENT_STATUS.DRAFT)).toBe("Tudo pronto: falta só publicar")
  })

  it("lista o que falta", () => {
    expect(getReadinessSummary({ ready: false, missing: ["lote", "termo"] }, EVENT_STATUS.PUBLISHED)).toBe("Falta: lote, termo")
  })
})
