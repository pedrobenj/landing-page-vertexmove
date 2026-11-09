import { TicketPercent } from "lucide-react"
import Link from "next/link"

import { EmptyState, ServerError } from "@/components/feedback"
import { PartnerRaceGrid } from "@/components/partner-races"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/server/api/api-error"
import { listPartnerRaces } from "@/server/api/endpoints/partner-races"
import type { PartnerRace } from "@/types/api/partner-race.interface"

/** Todas as corridas parceiras (4 estados: o skeleton fica no `<Suspense>` da página). */
export async function PartnerRaceList() {
  let races: PartnerRace[]
  try {
    races = await listPartnerRaces()
  } catch (error) {
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar as corridas parceiras" />
  }

  if (races.length === 0) {
    return (
      <EmptyState
        icon={TicketPercent}
        title="Nenhuma corrida parceira no momento."
        description="Logo teremos novas provas com cupom exclusivo para a comunidade. Enquanto isso, que tal correr com o Vertex?"
        action={
          <Button asChild variant="outline">
            <Link href="/#corridas">Ver próximas corridas</Link>
          </Button>
        }
      />
    )
  }

  return <PartnerRaceGrid races={races} />
}
