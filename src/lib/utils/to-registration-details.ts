import type { ApiRegistrationStatus, RegistrationDetails } from "@/types/api/registration-details.interface"

/** Resposta de `GET /inscricoes/:codigo` → tipo usado pelas telas de pagamento. */
export function toRegistrationDetails(raw: ApiRegistrationStatus): RegistrationDetails {
  return {
    codigo: raw.codigo,
    status: raw.status,
    evento: {
      slug: raw.eventoSlug ?? null,
      nome: raw.eventoNome,
      dataEvento: raw.dataEvento ?? null,
      horarioLargada: raw.horarioLargada ?? null,
    },
    distancia: raw.distanciaNome,
    valorBaseCentavos: null,
    valorDescontoCentavos: null,
    valorTotalCentavos: raw.valorTotalCentavos,
    pagamento: raw.pagamento ? { status: raw.pagamento.status } : null,
  }
}
