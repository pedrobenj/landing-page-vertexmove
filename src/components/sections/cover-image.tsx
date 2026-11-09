import Image from "next/image"

import { BrandCover } from "@/components/brand"
import { cn } from "@/lib/utils"

interface CoverImageProps {
  src: string | null | undefined
  alt: string
  sizes: string
  className?: string
}

/** Capa com `next/image` (preenche o pai, que deve ser `relative`); sem imagem → capa da marca. */
export function CoverImage({ src, alt, sizes, className }: CoverImageProps) {
  if (!src) return <BrandCover className={cn("absolute inset-0", className)} />

  return <Image src={src} alt={alt} fill sizes={sizes} className={cn("object-cover", className)} />
}
