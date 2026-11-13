import { describe, expect, it } from "vitest"

import type { PublicEvent } from "@/types/api/event.interface"

import { getNextEvent } from "./get-next-event"

function event(slug: string, dataEvento: string, horarioLargada = "05:30"): PublicEvent {
  return {
    slug,
    nome: slug,
    descricao: "",
    dataEvento,
    horarioLargada,
    localizacao: { localNome: "Praça", cidade: "Fortaleza", uf: "CE" },
    imagemCapaUrl: null,
  }
}

describe("getNextEvent", () => {
  it("escolhe a corrida com a data mais próxima, independentemente da ordem da lista", () => {
    const events = [event("dez", "2026-12-06"), event("nov", "2026-11-29"), event("jan", "2027-01-10")]
    expect(getNextEvent(events)?.slug).toBe("nov")
  })

  it("no mesmo dia, desempata pelo horário de largada", () => {
    const events = [event("noite", "2026-12-06", "19:00"), event("manha", "2026-12-06", "05:30")]
    expect(getNextEvent(events)?.slug).toBe("manha")
  })

  it("lista vazia → null", () => {
    expect(getNextEvent([])).toBeNull()
  })
})
