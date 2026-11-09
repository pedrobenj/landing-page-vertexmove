import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CursorPaginationProps {
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  /** Desabilita os botões enquanto a página carrega. */
  isLoading?: boolean
  /** Nome da lista para leitores de tela (ex.: "corridas"). */
  label: string
}

/** Anterior/Próxima para listas paginadas por cursor (a API não informa total nem número de páginas). */
export function CursorPagination({ hasPrevious, hasNext, onPrevious, onNext, isLoading = false, label }: CursorPaginationProps) {
  if (!hasPrevious && !hasNext) return null

  return (
    <nav aria-label={`Paginação de ${label}`} className="flex items-center justify-end gap-2">
      <Button type="button" variant="outline" onClick={onPrevious} disabled={!hasPrevious || isLoading}>
        <ChevronLeft aria-hidden="true" /> Anterior
      </Button>
      <Button type="button" variant="outline" onClick={onNext} disabled={!hasNext || isLoading}>
        Próxima <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  )
}
