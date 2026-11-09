import { z } from "zod"

import { fortalezaDateTimeField, intField, optionalIntField, priceCentsField } from "./form-fields"

const isComparable = (start: unknown, end: unknown) =>
  typeof start === "string" && typeof end === "string" && Number.isFinite(Date.parse(start)) && Number.isFinite(Date.parse(end))

/**
 * Lote de preço de uma distância. Chaves de `POST /admin/distancias/:id/lotes`: o preço é digitado em
 * reais e sai em `precoCentavos`; o período em `datetime-local` (Fortaleza) sai em ISO com `-03:00`.
 * O lote vigente é decidido pelo backend.
 */
export const priceTierFormSchema = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome (ex.: 1º lote)").max(80, "Nome com no máximo 80 caracteres"),
    precoCentavos: priceCentsField(),
    inicioEm: fortalezaDateTimeField("Informe o início das vendas"),
    fimEm: fortalezaDateTimeField("Informe o fim das vendas"),
    quantidadeTotal: optionalIntField("Quantidade deve ser um número inteiro maior que zero", { min: 1, max: 100_000 }),
    ordem: intField("Ordem deve ser um número inteiro", { max: 999 }),
    ativo: z.boolean(),
  })
  // Só compara quando as duas datas são válidas (senão o erro já está no próprio campo).
  .refine((tier) => !isComparable(tier.inicioEm, tier.fimEm) || Date.parse(tier.fimEm) > Date.parse(tier.inicioEm), {
    path: ["fimEm"],
    message: "O fim deve ser depois do início",
  })

export type PriceTierFormInput = z.input<typeof priceTierFormSchema>
export type PriceTierFormData = z.output<typeof priceTierFormSchema>
