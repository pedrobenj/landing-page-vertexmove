import { CalendarClock, Info, MapPin, PackageCheck } from "lucide-react"

import { cn, formatKitPickupWindow } from "@/lib/utils"
import type { ApiKitPickup } from "@/types/api/api-event-detail.interface"

interface KitPickupCardProps {
  pickup: ApiKitPickup | null | undefined
  /** `id` do título, para `aria-labelledby` de quem envolve o card. */
  titleId?: string
  /** Nível do título conforme a página (h3 dentro de uma seção da corrida, h2 na confirmação). */
  headingLevel?: "h2" | "h3"
  className?: string
}

/**
 * Local, janela e instruções da retirada do kit (`retiradaKit` de `GET /eventos/:slug`). Usado na página
 * da corrida e na confirmação da inscrição. Sem nenhum dado (`null` ou só campos vazios), não renderiza.
 */
export function KitPickupCard({ pickup, titleId = "retirada-kit-title", headingLevel = "h3", className }: KitPickupCardProps) {
  const Heading = headingLevel
  if (!pickup) return null
  const when = formatKitPickupWindow(pickup.inicio, pickup.fim)
  const place = pickup.local?.trim() || null
  const address = pickup.endereco?.trim() || null
  const instructions = pickup.instrucoes?.trim() || null
  if (!when && !place && !address && !instructions) return null

  return (
    <section aria-labelledby={titleId} className={cn("flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:p-6", className)}>
      <Heading id={titleId} className="flex items-center gap-2 font-heading text-lg font-black text-brand-navy-deep">
        <PackageCheck aria-hidden="true" className="size-5 text-brand-green-text" />
        Retirada do kit
      </Heading>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {when && (
          <div className="flex items-start gap-2">
            <CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green-text" />
            <div>
              <dt className="font-bold text-brand-navy-deep">Quando</dt>
              <dd className="text-muted-foreground">{when}</dd>
            </div>
          </div>
        )}
        {(place || address) && (
          <div className="flex items-start gap-2">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green-text" />
            <div>
              <dt className="font-bold text-brand-navy-deep">Onde</dt>
              {place && <dd className="text-muted-foreground">{place}</dd>}
              {address && (
                <dd>
                  <address className="text-muted-foreground not-italic">{address}</address>
                </dd>
              )}
            </div>
          </div>
        )}
        {instructions && (
          <div className="flex items-start gap-2 sm:col-span-2">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green-text" />
            <div>
              <dt className="font-bold text-brand-navy-deep">Instruções</dt>
              <dd className="whitespace-pre-line text-muted-foreground">{instructions}</dd>
            </div>
          </div>
        )}
      </dl>
    </section>
  )
}
