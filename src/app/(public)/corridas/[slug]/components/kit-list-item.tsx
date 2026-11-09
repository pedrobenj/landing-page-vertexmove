import { Package } from "lucide-react"

import { CoverImage } from "@/components/sections"
import type { PublicKit } from "@/types/api/public-event-detail.interface"

import { KitPhotoThumbnail } from "./kit-photo-thumbnail"

interface KitListItemProps {
  kit: PublicKit
}

/** Card do kit: foto principal (ou capa da marca), miniaturas, nome e descrição. */
export function KitListItem({ kit }: KitListItemProps) {
  const [cover, ...extraPhotos] = [...kit.fotos].sort((a, b) => a.ordem - b.ordem)

  return (
    <li>
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative aspect-video overflow-hidden bg-brand-navy-deep">
          <CoverImage src={cover?.url} alt={cover?.alt ?? kit.nome} sizes="(min-width: 640px) 50vw, 100vw" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="flex items-center gap-2 font-heading text-xl font-black text-brand-navy-deep">
            <Package aria-hidden="true" className="size-5 text-brand-green-text" />
            {kit.nome}
          </h3>
          {kit.descricao && <p className="text-muted-foreground">{kit.descricao}</p>}
          {extraPhotos.length > 0 && (
            <ul aria-label={`Mais fotos do ${kit.nome}`} className="mt-auto flex flex-wrap gap-2 pt-2">
              {extraPhotos.map((photo) => (
                <KitPhotoThumbnail key={photo.url} photo={photo} />
              ))}
            </ul>
          )}
        </div>
      </article>
    </li>
  )
}
