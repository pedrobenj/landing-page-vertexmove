import Image from "next/image"

import { cn } from "@/lib/utils"

interface VertexLogoProps {
  variant?: "full" | "white" | "symbol"
  className?: string
  priority?: boolean
}

const LOGO_SOURCES = {
  full: { src: "/brand/vertex-logo.png", width: 180, height: 72 },
  white: { src: "/brand/vertex-logo-white.png", width: 180, height: 72 },
  symbol: { src: "/brand/vertex-symbol.png", width: 40, height: 40 },
} as const

/** Logo oficial — nunca distorcer, recolorir ou aplicar sombra (CLAUDE.md §3). */
export function VertexLogo({ variant = "full", className, priority }: VertexLogoProps) {
  const logo = LOGO_SOURCES[variant]
  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt="Vertex Grupo de Corrida"
      priority={priority}
      className={cn("h-auto object-contain", className)}
    />
  )
}
