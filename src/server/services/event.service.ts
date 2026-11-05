import "server-only"

import { EventStatus } from "@/generated/prisma/enums"
import { env } from "@/lib/env"
import { db } from "@/server/db"
import { OPEN_EVENTS_MOCK } from "@/server/mocks/open-events.mock"

function queryOpenEvents() {
  return db.event.findMany({
    where: { status: EventStatus.OPEN },
    orderBy: { date: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      date: true,
      startTime: true,
      location: true,
      bannerUrl: true,
      modalities: { select: { id: true, name: true } },
    },
  })
}

export type OpenEvent = Awaited<ReturnType<typeof queryOpenEvents>>[number]

export async function listOpenEvents(): Promise<OpenEvent[]> {
  if (env.USE_MOCK_DATA) return OPEN_EVENTS_MOCK
  return queryOpenEvents()
}
