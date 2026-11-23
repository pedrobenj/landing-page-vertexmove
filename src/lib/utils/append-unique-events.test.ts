import { describe, expect, it } from "vitest"

import type { PublicEvent } from "@/types/api/event.interface"

import { appendUniqueEvents } from "./append-unique-events"

function event(slug: string): PublicEvent {
  return { slug, nome: slug } as PublicEvent
}

describe("appendUniqueEvents", () => {
  it("acrescenta a página seguinte mantendo a ordem", () => {
    expect(appendUniqueEvents([event("a"), event("b")], [event("c")]).map((e) => e.slug)).toEqual(["a", "b", "c"])
  })

  it("ignora o que já está na lista (corrida que mudou de página entre os cliques)", () => {
    expect(appendUniqueEvents([event("a"), event("b")], [event("b"), event("c")]).map((e) => e.slug)).toEqual([
      "a",
      "b",
      "c",
    ])
  })
})
