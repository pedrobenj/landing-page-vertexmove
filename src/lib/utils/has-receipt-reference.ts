import type { RegistrationLookupItem } from "@/types/api/registration.interface"

/**
 * O backend real ainda não envia `referencia` na consulta (fase 6 do plano): sem ela não há como pedir
 * o comprovante, então o botão não aparece.
 */
export function hasReceiptReference(
  item: Pick<RegistrationLookupItem, "referencia">,
): item is { referencia: string } {
  return Boolean(item.referencia)
}
