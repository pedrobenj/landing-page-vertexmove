import Image from "next/image"

import { BrandCover } from "@/components/brand"
import { StaggerItem } from "@/components/motion"
import { cn } from "@/lib/utils"
import type { ConnectionPhoto } from "@/types/connection-photo.interface"

interface ConnectionPhotoItemProps {
  /** `null` = espaço reservado (capa da marca) enquanto as fotos não chegam. */
  photo: ConnectionPhoto | null
  featured: boolean
}

/**
 * No hover a foto se expande: o quadro cresce um pouco por cima dos vizinhos e a imagem dá zoom dentro dele.
 * A escala (propriedade `scale` no Tailwind v4) fica num elemento interno, longe do `transform` que o `StaggerItem` anima na entrada. Sem animação
 * com `prefers-reduced-motion` (`motion-safe:`).
 */
export function ConnectionPhotoItem({ photo, featured }: ConnectionPhotoItemProps) {
  return (
    <StaggerItem
      className={cn(
        "relative hover:z-10",
        featured ? "col-span-2 aspect-[4/3] lg:row-span-2 lg:aspect-auto" : "aspect-square",
      )}
    >
      <div
        data-testid="connection-photo-frame"
        className="group absolute inset-0 overflow-hidden rounded-2xl bg-white/5 shadow-none transition-[scale,box-shadow] duration-500 ease-out motion-safe:hover:scale-[1.04] hover:shadow-2xl hover:shadow-black/40"
      >
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
            className="object-cover transition-[scale] duration-700 ease-out motion-safe:group-hover:scale-110"
          />
        ) : (
          <BrandCover className="absolute inset-0 transition-[scale] duration-700 ease-out motion-safe:group-hover:scale-110" />
        )}
      </div>
    </StaggerItem>
  )
}
