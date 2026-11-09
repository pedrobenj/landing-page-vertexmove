/** Sufixo único por execução: o mock guarda tudo em memória no `next dev` reaproveitado entre execuções. */
export function uniqueSuffix(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
}
