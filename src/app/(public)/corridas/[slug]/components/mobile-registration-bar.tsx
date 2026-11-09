import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface MobileRegistrationBarProps {
  lowestPrice: number | null
  registrationHref: string
}

/**
 * Barra fixa no rodapé, só no mobile, com o "a partir de" e o botão "Inscrever-se". Sem preço
 * (tudo esgotado), mostra "Inscrições esgotadas" sem botão.
 *
 * O `data-sticky-cta` faz o `SiteFooter` reservar, depois do crédito, o espaço que a barra ocupa.
 */
export function MobileRegistrationBar({ lowestPrice, registrationHref }: MobileRegistrationBarProps) {
  return (
    <div
      data-testid="mobile-registration-bar"
      data-sticky-cta=""
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(0_0_0/0.08)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {lowestPrice !== null ? (
          <>
            <p className="flex flex-col leading-tight">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">A partir de</span>
              <span className="font-heading text-xl font-black text-brand-navy-deep">{formatCurrency(lowestPrice)}</span>
            </p>
            <Button asChild variant="cta" size="xl" className="px-5 normal-case tracking-normal">
              <Link href={registrationHref}>
                Inscrever-se
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </>
        ) : (
          <p className="flex h-12 items-center font-heading text-base font-black text-brand-navy-deep">
            Inscrições esgotadas
          </p>
        )}
      </div>
    </div>
  )
}
