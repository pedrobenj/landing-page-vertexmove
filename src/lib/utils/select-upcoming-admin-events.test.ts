import { describe, expect, it } from "vitest"

import { EVENT_STATUS } from "@/enums/event-status.enum"
import type { AdminEvent } from "@/types/api/admin-event.interface"

import { selectUpcomingAdminEvents } from "./select-upcoming-admin-events"

const event = (id: number, dataEvento: string, status = EVENT_STATUS.PUBLISHED, horarioLargada = "06:00") =>
  ({ id, dataEvento, status, horarioLargada }) as AdminEvent

describe("selectUpcomingAdminEvents", () => {
  it("só rascunhos e publicadas de hoje em diante, por data/largada, até o limite", () => {
    const events = [
      event(1, "2026-12-10"),
      event(2, "2026-11-13"),
      event(3, "2026-11-14", EVENT_STATUS.DRAFT, "07:00"),
      event(4, "2026-11-14", EVENT_STATUS.PUBLISHED, "05:30"),
      event(5, "2026-11-20", EVENT_STATUS.CANCELLED),
      event(6, "2026-11-21", EVENT_STATUS.CLOSED),
      event(7, "2026-11-30"),
    ]
    expect(selectUpcomingAdminEvents(events, "2026-11-14").map((e) => e.id)).toEqual([4, 3, 7])
    expect(selectUpcomingAdminEvents(events, "2026-11-14", 5).map((e) => e.id)).toEqual([4, 3, 7, 1])
  })
})
