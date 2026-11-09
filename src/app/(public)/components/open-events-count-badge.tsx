import { Flag } from "lucide-react"

import { PillBadge } from "@/components/sections"
import { isApiError } from "@/server/api/api-error"
import { listPublicEvents } from "@/server/api/endpoints/events"
import { pluralize } from "@/lib/utils"

/** Selo dinâmico do card "Próximas corridas". Em erro, volta ao selo sem número. */
export async function OpenEventsCountBadge() {
  let count: number
  try {
    const page = await listPublicEvents()
    count = page.items.length
  } catch (error) {
    if (!isApiError(error)) throw error
    return <PillBadge icon={Flag}>Inscrições abertas</PillBadge>
  }

  if (count === 0) return <PillBadge icon={Flag}>Em breve</PillBadge>

  return <PillBadge icon={Flag}>{pluralize(count, "corrida aberta", "corridas abertas")}</PillBadge>
}
