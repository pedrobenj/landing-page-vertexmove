import { ImageIcon } from "lucide-react"

import type { KitPhoto } from "@/types/api/kit.interface"

interface KitPhotoLinkProps {
  photo: KitPhoto
}

/** Foto do kit como link (a URL é livre: sem pré-visualização para não depender do host da imagem). */
export function KitPhotoLink({ photo }: KitPhotoLinkProps) {
  return (
    <li>
      <a
        href={photo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-brand-navy hover:underline"
      >
        <ImageIcon className="size-4 text-brand-green-text" aria-hidden="true" />
        {photo.alt}
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    </li>
  )
}
