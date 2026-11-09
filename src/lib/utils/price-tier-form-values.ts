import type { PriceTierFormInput } from "@/lib/validations/price-tier.schema"
import type { PriceTier } from "@/types/api/price-tier.interface"

import { formatCentsInput } from "./currency-input"
import { toFortalezaLocalInput } from "./fortaleza-datetime"

/** Formulário vazio de novo lote; a ordem sugerida vem depois dos existentes. */
export function getEmptyPriceTierForm(nextOrder: number): PriceTierFormInput {
  return { nome: "", precoCentavos: "", inicioEm: "", fimEm: "", quantidadeTotal: "", ordem: String(nextOrder), ativo: true }
}

/** Lote da API → valores do formulário (centavos → "89,90"; ISO → `datetime-local` em Fortaleza). */
export function toPriceTierFormValues(tier: PriceTier): PriceTierFormInput {
  return {
    nome: tier.nome,
    precoCentavos: formatCentsInput(tier.precoCentavos),
    inicioEm: toFortalezaLocalInput(tier.inicioEm),
    fimEm: toFortalezaLocalInput(tier.fimEm),
    quantidadeTotal: tier.quantidadeTotal === null ? "" : String(tier.quantidadeTotal),
    ordem: String(tier.ordem),
    ativo: tier.ativo,
  }
}
