import { Badge } from "@/components/ui/badge"
import { toKitFormValues } from "@/lib/utils/kit-form-values"
import { pluralize } from "@/lib/utils/pluralize"
import type { Kit } from "@/types/api/kit.interface"

import { KitFormDialog } from "./kit-form-dialog"
import { KitPhotoLink } from "./kit-photo-link"

interface KitCardProps {
  eventId: number
  kit: Kit
  canManage: boolean
}

export function KitCard({ eventId, kit, canManage }: KitCardProps) {
  const photos = [...kit.fotos].sort((a, b) => a.ordem - b.ordem)
  return (
    <li>
      <article aria-labelledby={`kit-${kit.id}-title`} className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={`kit-${kit.id}-title`} className="font-heading text-lg font-extrabold text-brand-navy">
              {kit.nome}
            </h2>
            <Badge variant={kit.ativo ? "default" : "outline"}>{kit.ativo ? "Ativo" : "Inativo"}</Badge>
          </div>
          {canManage && <KitFormDialog eventId={eventId} kit={{ id: kit.id, nome: kit.nome }} defaultValues={toKitFormValues(kit)} />}
        </header>
        {kit.descricao && <p className="text-sm text-foreground">{kit.descricao}</p>}
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {photos.length === 0 ? "Sem fotos" : pluralize(photos.length, "foto", "fotos")}
        </p>
        {photos.length > 0 && (
          <ul className="flex flex-col gap-1">
            {photos.map((photo, index) => (
              // A API não dá id às fotos: posição + URL é estável dentro do kit (fotos repetidas mudam de posição).
              <KitPhotoLink key={`${index}-${photo.url}`} photo={photo} />
            ))}
          </ul>
        )}
      </article>
    </li>
  )
}
