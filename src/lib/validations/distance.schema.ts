import { z } from "zod"

import { intField, optionalTextField, optionalTimeField, optionalUrlField } from "./form-fields"

/** Distância (modalidade) de uma corrida. Chaves de `POST /admin/eventos/:id/distancias`. */
export const distanceFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome (ex.: 5 km)").max(80, "Nome com no máximo 80 caracteres"),
  descricao: optionalTextField,
  distanciaMetros: intField("Informe a distância em metros (ex.: 5000)", { min: 1, max: 500_000 }),
  capacidadeTotal: intField("Informe o número de vagas", { min: 1, max: 100_000 }),
  horarioLargada: optionalTimeField,
  percursoUrl: optionalUrlField,
  ordem: intField("Ordem deve ser um número inteiro", { max: 999 }),
  ativo: z.boolean(),
})

export type DistanceFormInput = z.input<typeof distanceFormSchema>
export type DistanceFormData = z.output<typeof distanceFormSchema>
