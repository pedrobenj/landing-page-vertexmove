import { StaggerGroup } from "@/components/motion"
import type { ConnectionPhoto } from "@/types/connection-photo.interface"

import { ConnectionPhotoItem } from "./connection-photo-item"

/** Mosaico: 1 destaque + 4 menores. */
const GALLERY_SIZE = 5

interface ConnectionsGalleryProps {
  photos: ConnectionPhoto[]
}

/** Fotos das Conexões. Sem fotos, os espaços mostram a capa da marca (só decoração, fora da leitura de tela). */
export function ConnectionsGallery({ photos }: ConnectionsGalleryProps) {
  const slots: (ConnectionPhoto | null)[] =
    photos.length > 0 ? photos.slice(0, GALLERY_SIZE) : Array.from({ length: GALLERY_SIZE }, () => null)
  const hasPhotos = photos.length > 0

  return (
    <StaggerGroup
      as="ul"
      aria-label={hasPhotos ? "Fotos das Conexões" : undefined}
      aria-hidden={hasPhotos ? undefined : true}
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2"
    >
      {slots.map((photo, index) => (
        <ConnectionPhotoItem key={photo?.src ?? `placeholder-${index}`} photo={photo} featured={index === 0} />
      ))}
    </StaggerGroup>
  )
}
