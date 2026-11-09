"use client"

import Image from "next/image"
import { useState } from "react"

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

/**
 * Logo oficial — nunca distorcer, recolorir ou aplicar sombra (CLAUDE.md §3).
 * Enquanto os arquivos de `public/brand/` não chegarem do cliente, cai para o nome em texto.
 */
export function VertexLogo({ variant = "full", className, priority }: VertexLogoProps) {
  const [hasError, setHasError] = useState(false)
  const logo = LOGO_SOURCES[variant]

  if (hasError) {
    return (
      <span
        role="img"
        aria-label="Vertex Grupo de Corrida"
        data-logo-fallback=""
        className={cn(
          "inline-flex items-center justify-center font-heading font-black uppercase leading-none tracking-tight",
          variant === "white" ? "text-white" : "text-brand-navy",
          className,
        )}
      >
        {variant === "symbol" ? "V" : "Vertex"}
      </span>
    )
  }

  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt="Vertex Grupo de Corrida"
      priority={priority}
      onError={() => setHasError(true)}
      className={cn("h-auto object-contain", className)}
    />
  )
}
