/**
 * Dados de teste únicos por execução: o mock da API guarda as inscrições em memória no `next dev`
 * reaproveitado entre execuções, então um CPF fixo daria "inscrição duplicada" na segunda vez.
 */

function checkDigit(digits: number[]): number {
  const factor = digits.length + 1
  const total = digits.reduce((sum, digit, index) => sum + digit * (factor - index), 0)
  const rest = (total * 10) % 11
  return rest === 10 ? 0 : rest
}

/** CPF válido (11 dígitos, sem máscara) com base aleatória. */
export function generateValidCpf(): string {
  let base: number[]
  do {
    base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  } while (base.every((digit) => digit === base[0]))
  const first = checkDigit(base)
  const second = checkDigit([...base, first])
  return [...base, first, second].join("")
}

/** Celular de Fortaleza aleatório, só dígitos (ex.: `85987654321`). */
export function generateWhatsapp(): string {
  const suffix = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("")
  return `859${suffix}`
}
