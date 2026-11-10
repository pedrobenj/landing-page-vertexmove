import { formatApiDate, formatCurrency } from "@/lib/utils"
import type { RegistrationDetails } from "@/types/api/registration-details.interface"

import { RegistrationSummaryRow } from "./registration-summary-row"

interface RegistrationSummaryProps {
  details: RegistrationDetails
}

export function RegistrationSummary({ details }: RegistrationSummaryProps) {
  const { evento, distancia, valorDescontoCentavos, valorTotalCentavos } = details
  const when = evento.dataEvento ? `${formatApiDate(evento.dataEvento)} · largada ${evento.horarioLargada}` : "—"

  return (
    <section aria-labelledby="registration-summary-title" className="rounded-2xl border bg-card p-6">
      <h2 id="registration-summary-title" className="font-heading text-lg font-black text-brand-navy-deep">
        Resumo da inscrição
      </h2>
      <dl className="mt-2 divide-y">
        <RegistrationSummaryRow label="Corrida" value={evento.nome} />
        <RegistrationSummaryRow label="Data" value={when} />
        <RegistrationSummaryRow label="Distância" value={distancia} />
        {valorDescontoCentavos > 0 && (
          <RegistrationSummaryRow label="Desconto" value={`− ${formatCurrency(valorDescontoCentavos)}`} />
        )}
        <RegistrationSummaryRow label="Total" value={formatCurrency(valorTotalCentavos)} emphasis />
      </dl>
    </section>
  )
}
