// "1.234,56" / "1234,56" / "89" — ponto só como separador de milhar.
const BRL_PATTERN = /^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/
// "89.90" / "89.9" — ponto como separador decimal (teclado do celular).
const DOT_DECIMAL_PATTERN = /^\d+\.\d{1,2}$/

function toCents(reais: string, cents = ""): number {
  return Number(reais) * 100 + Number(cents.padEnd(2, "0"))
}

/**
 * Converte "1.234,56" / "R$ 89,90" / "89" / "89.90" em centavos.
 * Retorna null se inválido ou negativo.
 */
export function parseCurrencyInput(value: string): number | null {
  const cleaned = value.replace(/R\$\s?/, "").trim()
  if (DOT_DECIMAL_PATTERN.test(cleaned)) {
    const [reais, cents] = cleaned.split(".")
    return toCents(reais, cents)
  }
  if (!BRL_PATTERN.test(cleaned)) return null
  const [reais, cents] = cleaned.replace(/\./g, "").split(",")
  return toCents(reais, cents)
}

/** Centavos → texto do input ("89,90"). */
export function formatCentsInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",")
}
