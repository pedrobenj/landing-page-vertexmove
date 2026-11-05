/** Converte "1.234,56" / "R$ 89,90" / "89" em centavos. Retorna null se inválido ou negativo. */
export function parseCurrencyInput(value: string): number | null {
  const cleaned = value.replace(/R\$\s?/, "").trim().replace(/\./g, "")
  if (!/^\d+(,\d{1,2})?$/.test(cleaned)) return null
  const [reais, cents = ""] = cleaned.split(",")
  return Number(reais) * 100 + Number(cents.padEnd(2, "0"))
}

/** Centavos → texto do input ("89,90"). */
export function formatCentsInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",")
}
