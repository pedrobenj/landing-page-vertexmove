import { onlyDigits } from "./only-digits"

function calcCheckDigit(digits: string, factor: number): number {
  let total = 0
  for (const digit of digits) {
    total += Number(digit) * factor--
  }
  const rest = (total * 10) % 11
  return rest === 10 ? 0 : rest
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const first = calcCheckDigit(cpf.slice(0, 9), 10)
  const second = calcCheckDigit(cpf.slice(0, 10), 11)
  return first === Number(cpf[9]) && second === Number(cpf[10])
}
