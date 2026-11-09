import type { KitFormInput, KitPhotoFormInput } from "@/lib/validations/kit.schema"
import type { Kit } from "@/types/api/kit.interface"

export const EMPTY_KIT_FORM: KitFormInput = { nome: "", descricao: "", ativo: true, fotos: [] }

export const EMPTY_KIT_PHOTO: KitPhotoFormInput = { url: "", alt: "" }

/** Kit da API → valores do formulário: fotos na ordem da API (a posição vira a `ordem` ao salvar). */
export function toKitFormValues(kit: Kit): KitFormInput {
  return {
    nome: kit.nome,
    descricao: kit.descricao ?? "",
    ativo: kit.ativo,
    fotos: [...kit.fotos].sort((a, b) => a.ordem - b.ordem).map((photo) => ({ url: photo.url, alt: photo.alt })),
  }
}
