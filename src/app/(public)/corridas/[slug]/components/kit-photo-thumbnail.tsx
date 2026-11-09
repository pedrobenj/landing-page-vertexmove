import Image from "next/image"

import type { KitPhoto } from "@/types/api/kit.interface"

interface KitPhotoThumbnailProps {
  photo: KitPhoto
}

/** Miniatura das fotos extras do kit. */
export function KitPhotoThumbnail({ photo }: KitPhotoThumbnailProps) {
  return (
    <li className="relative size-16 overflow-hidden rounded-lg border bg-slate-100">
      <Image src={photo.url} alt={photo.alt} fill sizes="64px" className="object-cover" />
    </li>
  )
}
