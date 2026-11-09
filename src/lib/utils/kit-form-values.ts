import type { KitFormInput, KitPhotoFormInput } from "@/lib/validations/kit.schema"
import type { Kit } from "@/types/api/kit.interface"

import { getNextOrder } from "./next-order"

export const EMPTY_KIT_FORM: KitFormInput = { nome: "", descricao: "", ativo: true, fotos: [] }

/** Foto nova no formulário, com a ordem depois das existentes. */
export function getEmptyKitPhoto(photos: ReadonlyArray<{ ordem: string }>): KitPhotoFormInput {
  const orders = photos.map((photo) => ({ ordem: Number(photo.ordem) || 0 }))
  return { url: "", alt: "", ordem: String(getNextOrder(orders)) }
}

/** Kit da API → valores do formulário. */
export function toKitFormValues(kit: Kit): KitFormInput {
  return {
    nome: kit.nome,
    descricao: kit.descricao ?? "",
    ativo: kit.ativo,
    fotos: [...kit.fotos]
      .sort((a, b) => a.ordem - b.ordem)
      .map((photo) => ({ url: photo.url, alt: photo.alt, ordem: String(photo.ordem) })),
  }
}
