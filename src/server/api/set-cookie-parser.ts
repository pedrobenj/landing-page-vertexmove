import "server-only"

export interface ParsedSetCookie {
  value: string
  /** Segundos; `undefined` quando o cookie é de sessão (sem `Max-Age` nem `Expires`). */
  maxAge?: number
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseMaxAge(attributes: Map<string, string>): number | undefined {
  const maxAge = attributes.get("max-age")
  if (maxAge !== undefined && /^-?\d+$/.test(maxAge)) return Math.max(Number(maxAge), 0)

  const expires = attributes.get("expires")
  const expiresAt = expires ? Date.parse(expires) : Number.NaN
  if (Number.isNaN(expiresAt)) return undefined
  return Math.max(Math.round((expiresAt - Date.now()) / 1000), 0)
}

function parseOne(header: string): [string, ParsedSetCookie] | null {
  const [pair, ...rawAttributes] = header.split(";")
  const separator = pair.indexOf("=")
  if (separator <= 0) return null

  const name = pair.slice(0, separator).trim()
  if (!name) return null
  const value = safeDecode(pair.slice(separator + 1).trim())

  const attributes = new Map<string, string>()
  for (const attribute of rawAttributes) {
    const [key, ...rest] = attribute.split("=")
    attributes.set(key.trim().toLowerCase(), rest.join("=").trim())
  }

  const maxAge = parseMaxAge(attributes)
  return [name, maxAge === undefined ? { value } : { value, maxAge }]
}

/** Cookies de uma resposta do backend (ex.: `vm_admin_rt` e `vm_admin_csrf` do login/refresh), por nome. */
export function parseSetCookies(headers: Headers): Record<string, ParsedSetCookie> {
  const result: Record<string, ParsedSetCookie> = {}
  for (const header of headers.getSetCookie()) {
    const parsed = parseOne(header)
    if (parsed) result[parsed[0]] = parsed[1]
  }
  return result
}
