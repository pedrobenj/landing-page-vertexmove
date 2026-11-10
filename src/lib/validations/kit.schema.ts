import { z } from "zod"

import { optionalTextField, priceCentsField, urlField } from "./form-fields"

export const MAX_KIT_PHOTOS = 10

/** Foto do kit: só URL (o upload não está no escopo) e texto alternativo. A ordem é a posição na lista. */
const kitPhotoSchema = z.object({
  url: urlField,
  alt: z.string().trim().min(1, "Descreva a foto (texto alternativo)").max(200, "No máximo 200 caracteres"),
})

/** Kit da corrida. Chaves de `POST /admin/eventos/:id/kits`. */
export const kitFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do kit").max(80, "Nome com no máximo 80 caracteres"),
  descricao: optionalTextField,
  /** Digitado em reais; somado ao valor do lote na inscrição. */
  precoCentavos: priceCentsField(),
  ativo: z.boolean(),
  fotos: z
    .array(kitPhotoSchema)
    .max(MAX_KIT_PHOTOS, `No máximo ${MAX_KIT_PHOTOS} fotos`)
    // `ordem` da API = posição na lista (1, 2, 3...), reordenada com os botões subir/descer.
    .transform((photos) => photos.map((photo, index) => ({ ...photo, ordem: index + 1 }))),
})

export type KitFormInput = z.input<typeof kitFormSchema>
export type KitFormData = z.output<typeof kitFormSchema>
export type KitPhotoFormInput = KitFormInput["fotos"][number]
