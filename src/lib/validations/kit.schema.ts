import { z } from "zod"

import { intField, optionalTextField, urlField } from "./form-fields"

export const MAX_KIT_PHOTOS = 10

/** Foto do kit: só URL (o upload não está no escopo), texto alternativo e ordem. */
const kitPhotoSchema = z.object({
  url: urlField,
  alt: z.string().trim().min(1, "Descreva a foto (texto alternativo)").max(200, "No máximo 200 caracteres"),
  ordem: intField("Ordem deve ser um número inteiro", { max: 999 }),
})

/** Kit da corrida. Chaves de `POST /admin/eventos/:id/kits`. */
export const kitFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do kit").max(80, "Nome com no máximo 80 caracteres"),
  descricao: optionalTextField,
  ativo: z.boolean(),
  fotos: z.array(kitPhotoSchema).max(MAX_KIT_PHOTOS, `No máximo ${MAX_KIT_PHOTOS} fotos`),
})

export type KitFormInput = z.input<typeof kitFormSchema>
export type KitFormData = z.output<typeof kitFormSchema>
export type KitPhotoFormInput = KitFormInput["fotos"][number]
