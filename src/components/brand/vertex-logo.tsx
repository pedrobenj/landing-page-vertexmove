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
  // Logo oficial em SVG (quadrada, fundo branco): usar sobre fundo claro ou na `VertexLogoPlate`.
  full: { src: "/brand/vertex-logo.svg", width: 1254, height: 1254 },
  white: { src: "/brand/vertex-logo-white.png", width: 180, height: 72 },
  symbol: { src: "/brand/vertex-symbol.png", width: 40, height: 40 },
} as const

/**
 * Logo oficial — nunca distorcer, recolorir ou aplicar sombra (CLAUDE.md §3).
 * Se o arquivo de `public/brand/` faltar, cai para o nome em texto.
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
      // SVG não passa pelo otimizador do Next (exigiria `dangerouslyAllowSVG`).
      unoptimized={logo.src.endsWith(".svg")}
      onError={() => setHasError(true)}
      className={cn("h-auto object-contain", className)}
    />
  )
}
