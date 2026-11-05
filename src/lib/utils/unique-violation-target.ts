function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
  return []
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined
}

/**
 * Diz se um erro P2002 (`PrismaClientKnownRequestError.meta`) foi causado pela unicidade de `field`.
 * Aceita o formato clássico (`meta.target`) e o dos driver adapters do Prisma 7
 * (`meta.driverAdapterError.cause.constraint` com `index` ou `fields`).
 */
export function isUniqueViolationOn(meta: unknown, field: string): boolean {
  const record = asRecord(meta)
  if (!record) return false

  const constraint = asRecord(asRecord(asRecord(record.driverAdapterError)?.cause)?.constraint)
  const targets = [
    ...collectStrings(record.target),
    ...collectStrings(constraint?.index),
    ...collectStrings(constraint?.fields),
  ]

  return targets.some((target) => target === field || target.split("_").includes(field))
}
