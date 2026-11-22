import { AdminBackLink, AdminPageBody, AdminPageHero, ReadOnlyNotice } from "@/components/admin"
import { toPartnerRaceFormValues } from "@/lib/utils/partner-race-form-values"
import type { AdminPartnerRace } from "@/types/api/partner-race.interface"

import { PartnerRaceForm } from "../../components"

import { DeletePartnerRaceButton } from "./delete-partner-race-button"

interface EditPartnerRaceProps {
  race: AdminPartnerRace
  canManage: boolean
}

export function EditPartnerRace({ race, canManage }: EditPartnerRaceProps) {
  return (
    <>
      <AdminPageHero
        id="edit-partner-race-title"
        eyebrow="Outras trilhas"
        title={race.nome}
        before={<AdminBackLink href="/admin/corridas-parceiras">Corridas parceiras</AdminBackLink>}
      />
      <AdminPageBody>
        {!canManage && <ReadOnlyNotice>Seu perfil tem acesso somente leitura às corridas parceiras.</ReadOnlyNotice>}
        <PartnerRaceForm defaultValues={toPartnerRaceFormValues(race)} raceId={race.id} canManage={canManage} />
        {/* Destrutiva no corpo, não na faixa navy (sem contraste para o vermelho). */}
        {canManage && (
          <section aria-labelledby="delete-partner-race-title" className="flex max-w-2xl flex-col gap-3 border-t pt-6">
            <h2 id="delete-partner-race-title" className="font-heading text-lg font-black text-brand-navy-deep">
              Excluir
            </h2>
            <p className="text-sm text-muted-foreground">
              Some do site e do admin de vez. Para só esconder do site, desmarque &quot;Ativa&quot;.
            </p>
            <DeletePartnerRaceButton id={race.id} />
          </section>
        )}
      </AdminPageBody>
    </>
  )
}
