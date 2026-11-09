import { Package } from "lucide-react"

import { EmptyState, ServerError } from "@/components/feedback"
import { EMPTY_KIT_FORM } from "@/lib/utils/kit-form-values"
import { isApiError } from "@/server/api/api-error"
import { listKits } from "@/server/api/endpoints/kits"
import type { Kit } from "@/types/api/kit.interface"

import { KitCard } from "./kit-card"
import { KitFormDialog } from "./kit-form-dialog"

interface KitListProps {
  eventId: number
  canManage: boolean
}

/** Kits da corrida (a página já conferiu a sessão; o `adminFetch` exige o token). */
export async function KitList({ eventId, canManage }: KitListProps) {
  let kits: Kit[]
  try {
    kits = await listKits(eventId)
  } catch (error) {
    // Só ApiError vira ServerError: o redirect do adminFetch (sessão expirada) sobe.
    if (!isApiError(error)) throw error
    return <ServerError title="Não foi possível carregar os kits" />
  }

  const newKit = canManage ? <KitFormDialog eventId={eventId} defaultValues={EMPTY_KIT_FORM} /> : undefined

  // O botão fica sempre no mesmo lugar (fora do estado vazio): o foco volta para ele ao fechar o diálogo.
  return (
    <div className="flex flex-col gap-4">
      {newKit && <div className="flex justify-end">{newKit}</div>}
      {kits.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum kit cadastrado."
          description={canManage ? "Sem kit, a inscrição segue só com a distância." : undefined}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {kits.map((kit) => (
            <KitCard key={kit.id} eventId={eventId} kit={kit} canManage={canManage} />
          ))}
        </ul>
      )}
    </div>
  )
}
