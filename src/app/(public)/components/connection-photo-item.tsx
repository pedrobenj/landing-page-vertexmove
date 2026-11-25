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

export function ConnectionPhotoItem({ photo, featured }: ConnectionPhotoItemProps) {
  return (
    <StaggerItem
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white/5",
        featured ? "col-span-2 aspect-[4/3] lg:row-span-2 lg:aspect-auto" : "aspect-square",
      )}
    >
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          className="object-cover"
        />
      ) : (
        <BrandCover className="absolute inset-0" />
      )}
    </StaggerItem>
  )
}
