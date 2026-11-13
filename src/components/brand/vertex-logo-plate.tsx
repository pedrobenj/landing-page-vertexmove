import { cn } from "@/lib/utils"

import { VertexLogo } from "./vertex-logo"

interface VertexLogoPlateProps {
  className?: string
  priority?: boolean
}

/**
 * Logo colorida sobre uma "placa" branca arredondada, para fundos escuros (header e rodapé).
 * A logo é quadrada e já tem margem própria, então a placa é quadrada e quase sem padding.
 * O tamanho vem da altura (`h-*`) passada em `className`.
 */
export function VertexLogoPlate({ className, priority }: VertexLogoPlateProps) {
  return (
    <span
      className={cn(
        "inline-flex aspect-square h-12 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 text-base shadow-sm",
        className,
      )}
    >
      <VertexLogo className="size-full" priority={priority} />
    </span>
  )
}
