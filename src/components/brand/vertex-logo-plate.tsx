import { cn } from "@/lib/utils"

import { VertexLogo } from "./vertex-logo"

interface VertexLogoPlateProps {
  className?: string
  priority?: boolean
}

/** Logo colorida sobre uma "placa" branca arredondada, para fundos escuros (header e rodapé). */
export function VertexLogoPlate({ className, priority }: VertexLogoPlateProps) {
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center justify-center overflow-hidden rounded-xl bg-white px-2.5 text-base shadow-sm",
        className,
      )}
    >
      <VertexLogo className="h-full max-h-8 w-auto" priority={priority} />
    </span>
  )
}
