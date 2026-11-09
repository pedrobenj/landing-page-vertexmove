/** Id numérico de um parâmetro de rota (`"12"` → `12`). Qualquer outra coisa → `null` (vira 404). */
export function parseIdParam(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}
