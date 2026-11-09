import { ServerError } from "@/components/feedback"
import { PartnerRaceGrid } from "@/components/partner-races"
import { isApiError } from "@/server/api/api-error"
import { listPartnerRaces } from "@/server/api/endpoints/partner-races"
import type { PartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRacesBand } from "./partner-races-band"

const HOME_LIMIT = 3

/** Até 3 corridas parceiras. Vazio → a seção some. */
export async function PartnerRaces() {
  let races: PartnerRace[]
  try {
    races = await listPartnerRaces()
  } catch (error) {
    if (!isApiError(error)) throw error
    return (
      <PartnerRacesBand>
        <ServerError title="Não foi possível carregar as corridas parceiras" />
      </PartnerRacesBand>
    )
  }

  if (races.length === 0) return null

  return (
    <PartnerRacesBand>
      <PartnerRaceGrid races={races.slice(0, HOME_LIMIT)} />
    </PartnerRacesBand>
  )
}
