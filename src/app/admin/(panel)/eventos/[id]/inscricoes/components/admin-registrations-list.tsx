import { listDistances } from "@/server/api/endpoints/distances"
import type { Distance } from "@/types/api/distance.interface"

import { RegistrationsList } from "./registrations-list"

interface AdminRegistrationsListProps {
  eventId: number
  canManage: boolean
}

/** Carrega as distâncias para o filtro (se falhar, a lista funciona sem ele) e monta a lista client. */
export async function AdminRegistrationsList({ eventId, canManage }: AdminRegistrationsListProps) {
  let distances: Pick<Distance, "id" | "nome">[] = []
  try {
    distances = (await listDistances(eventId)).map(({ id, nome }) => ({ id, nome }))
  } catch {
    distances = []
  }
  return <RegistrationsList eventId={eventId} distances={distances} canManage={canManage} />
}
