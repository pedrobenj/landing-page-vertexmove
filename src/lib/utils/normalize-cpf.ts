import { onlyDigits } from "./only-digits"

/** CPF como a API espera: só dígitos, no máximo 11. */
export function normalizeCpf(value: string): string {
  return onlyDigits(value).slice(0, 11)
}
