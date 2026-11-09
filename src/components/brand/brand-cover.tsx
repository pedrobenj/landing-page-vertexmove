import { cn } from "@/lib/utils"

import { Chevron } from "./chevron"

interface BrandCoverProps {
  className?: string
}

/**
 * Capa provisória: gradiente navy + chevron grande, no lugar de fotos que ainda não existem.
 * TODO(cliente): trocar por fotos reais de corredores de Fortaleza.
 */
export function BrandCover({ className }: BrandCoverProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden bg-linear-to-br from-brand-navy via-brand-navy-deep to-brand-navy-deep",
        className,
      )}
    >
      <Chevron className="absolute -right-[12%] -bottom-[18%] w-[85%] opacity-20" />
      <Chevron className="absolute top-[12%] left-[8%] w-[22%] opacity-10" />
    </div>
  )
}
