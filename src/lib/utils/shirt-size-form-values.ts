import type { ShirtSizeFormInput } from "@/lib/validations/shirt-size.schema"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

export function getEmptyShirtSizeForm(nextOrder: number): ShirtSizeFormInput {
  return { codigo: "", descricao: "", ordem: String(nextOrder), ativo: true }
}

export function toShirtSizeFormValues(size: ShirtSize): ShirtSizeFormInput {
  return { codigo: size.codigo, descricao: size.descricao ?? "", ordem: String(size.ordem), ativo: size.ativo }
}
